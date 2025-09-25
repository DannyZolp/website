package http11

import (
	"container/list"
	"net"
	"strings"
)

func HandleRequest(c net.Conn, request list.List) {
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

	switch method {
	case "GET":
		handleGet(c, request, path)
	case "POST":
		break
	case "PUT":
		badRequest(c)
	default:
		{
			badRequest(c)
		}
	}

}
