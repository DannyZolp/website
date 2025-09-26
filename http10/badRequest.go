package http10

import (
	"bufio"
	"net"

	"github.com/DannyZolp/website/helpers"
)

func badRequest(c net.Conn) {
	response := bufio.NewWriter(c)

	response.Write([]byte("HTTP/1.0 400 Bad Request\nContent-Type: text/html; charset=UTF-8\nReferrer-Policy: no-referrer\nDate: " + helpers.GetDate() + "\n\n<!doctype html><html><body><h1>400 Bad Request</h1></body></html>"))

	response.Flush()

	c.Close()
}
