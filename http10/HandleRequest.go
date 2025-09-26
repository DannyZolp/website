package http10

import (
	"bufio"
	"container/list"
	"net"
	"strings"

	"gorm.io/gorm"
)

func HandleRequest(c net.Conn, reader *bufio.Reader, request list.List, cachedFiles map[string][]byte, db *gorm.DB) {
	header := request.Front().Value.(string)
	header = strings.Replace(header, "HTTP/1.0", "", 1)
	methodAndPath := strings.Split(strings.Trim(header, " "), " ")

	var method, path string

	if strings.HasPrefix(methodAndPath[0], "/") {
		method = methodAndPath[1]
		path = methodAndPath[0]
	} else {
		method = methodAndPath[0]
		path = methodAndPath[1]
	}

	switch method {
	case "GET":
		handleGet(c, request, path, cachedFiles, db)
	case "POST":
		handlePost(c, reader, request, path, db)
	default:
		{
			badRequest(c)
		}
	}

}
