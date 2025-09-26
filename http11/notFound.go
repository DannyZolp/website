package http11

import (
	"bufio"
	"net"

	"github.com/DannyZolp/website/helpers"
)

func notFound(c net.Conn) {
	response := bufio.NewWriter(c)

	response.Write([]byte("HTTP/1.1 404 Not Found\nContent-Type: text/html; charset=UTF-8\nReferrer-Policy: no-referrer\nDate: " + helpers.GetDate() + "\n\n<!doctype html><html><body><h1>404 Not Found</h1></body></html>"))

	response.Flush()

	c.Close()
}
