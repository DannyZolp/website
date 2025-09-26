package http10

import (
	"bufio"
	"net"

	"github.com/DannyZolp/website/helpers"
)

func notFound(c net.Conn) {
	response := bufio.NewWriter(c)

	response.Write([]byte("HTTP/1.0 404 Not Found\r\nContent-Type: text/html; charset=UTF-8\r\nReferrer-Policy: no-referrer\r\nDate: " + helpers.GetDate() + "\r\n\r\n<!doctype html><html><body><h1>404 Not Found</h1></body></html>"))

	response.Flush()

	c.Close()
}
