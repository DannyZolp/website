package http11

import (
	"bufio"
	"container/list"
	"net"
	"strings"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

func HandleRequest(c net.Conn, reader *bufio.Reader, request list.List, cachedFiles map[string][]byte, db *gorm.DB, span trace.Span) {
	header := request.Front().Value.(string)
	header = strings.Replace(header, "HTTP/1.1", "", 1)
	methodAndPath := strings.Split(strings.Trim(header, " "), " ")

	var method, path string

	if strings.HasPrefix(methodAndPath[0], "/") {
		method = methodAndPath[1]
		path = methodAndPath[0]
	} else {
		method = methodAndPath[0]
		path = methodAndPath[1]
	}

	span.AddEvent("Parsed HTTP Method Header", trace.WithAttributes(attribute.String("method", method), attribute.String("path", path)))

	switch method {
	case "GET":
		handleGet(c, request, path, cachedFiles, db, span)
	case "POST":
		handlePost(c, reader, request, path, db, span)
	default:
		{
			notFound(c)
		}
	}

}
