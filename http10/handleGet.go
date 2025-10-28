package http10

import (
	"container/list"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"

	"github.com/DannyZolp/website/guestbook"
	"github.com/DannyZolp/website/helpers"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

func handleGet(c net.Conn, request list.List, path string, cachedFiles map[string][]byte, db *gorm.DB, span trace.Span) {
	var encoding helpers.Encoding = helpers.None
	hosts := strings.Split(os.Getenv("HOST"), ",")

	for e := request.Front(); e != nil; e = e.Next() {
		if strings.HasPrefix(e.Value.(string), "Host: ") {
			after, _ := strings.CutPrefix(e.Value.(string), "Host: ")
			host := strings.Trim(after, "\r\n ")
			validHost := false
			for _, h := range hosts {
				if strings.Contains(host, h) {
					validHost = true
					break
				}
			}

			if !validHost {
				span.AddEvent("Host in request is not allowed", trace.WithAttributes(attribute.String("host", e.Value.(string))))
				span.SetStatus(codes.Error, "Host in request is not allowed")
				badRequest(c)
				span.End()
				return
			}
		} else if strings.HasPrefix(e.Value.(string), "Accept-Encoding: ") {
			span.AddEvent("Found Encoding", trace.WithAttributes(attribute.String("encoding", e.Value.(string))))
			if strings.Contains(e.Value.(string), "gzip") {
				encoding = helpers.GZIP
			} else {
				encoding = helpers.None
			}
		}
	}

	if strings.HasPrefix(path, "/guestbook") {
		pageStr := strings.Replace(path, "/guestbook/", "", 1)
		page, err := strconv.Atoi(pageStr)

		if err != nil {
			span.SetStatus(codes.Error, "400")
			span.RecordError(err)
			badRequest(c)
			span.End()
			return
		}

		guestbook.GetGuestbookPage(db, page, c, span)
	} else if cachedFiles[path] != nil {
		c.Write([]byte("HTTP/1.0 200 OK\r\n"))
		c.Write([]byte("Server: github.com/DannyZolp/website\r\n"))
		c.Write([]byte("Date: " + helpers.GetDate() + "\r\n"))
		c.Write([]byte("Cache-Control: public, max-age=3600\r\n"))
		if strings.HasSuffix(path, ".json") {
			c.Write([]byte("Content-Type: application/json\r\n"))
		} else if strings.HasSuffix(path, ".pdf") {
			c.Write([]byte("Content-Type: application/pdf\r\n"))
		} else if strings.HasSuffix(path, ".css") {
			c.Write([]byte("Content-Type: text/css; charset=utf-8\r\n"))
		} else if strings.HasSuffix(path, ".js") {
			c.Write([]byte("Content-Type: text/javascript; charset=utf-8\r\n"))
		} else {
			c.Write([]byte("Content-Type: text/html; charset=utf-8\r\n"))
		}

		switch encoding {
		case helpers.None:
			c.Write([]byte(fmt.Sprintf("Content-Length: %d\r\n\r\n", len(cachedFiles[path]))))
			c.Write(cachedFiles[path])
		case helpers.GZIP:
			c.Write([]byte("Content-Encoding: x-gzip\r\n"))
			helpers.WriteWithGZIP(c, cachedFiles[path], true)
		}
	} else {
		notFound(c)
	}
	span.End()
	c.Close()

}
