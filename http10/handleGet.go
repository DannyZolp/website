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
	"gorm.io/gorm"
)

func handleGet(c net.Conn, request list.List, path string, cachedFiles map[string][]byte, db *gorm.DB) {
	var host string
	var encoding helpers.Encoding = helpers.None

	for e := request.Front(); e != nil; e = e.Next() {
		if strings.HasPrefix(e.Value.(string), "Host: ") {
			after, _ := strings.CutPrefix(e.Value.(string), "Host: ")
			host = strings.Trim(after, "\r\n ")
		} else if strings.HasPrefix(e.Value.(string), "Accept-Encoding: ") {
			if strings.Contains(e.Value.(string), "gzip") {
				encoding = helpers.GZIP
			} else {
				encoding = helpers.None
			}
		}
	}

	if strings.Contains(host, os.Getenv("HOST")) && host != "" {
		if strings.HasPrefix(path, "/guestbook") {
			pageStr := strings.Replace(path, "/guestbook/", "", 1)
			page, err := strconv.Atoi(pageStr)

			if err != nil {
				badRequest(c)
				return
			}

			guestbook.GetGuestbookPage(db, page, c)
			return
		} else if cachedFiles[path] != nil {
			c.Write([]byte("HTTP/1.0 200 OK\r\n"))
			c.Write([]byte("Server: github.com/DannyZolp/http\r\n"))
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
		c.Close()
	} else {
		badRequest(c)
	}
}
