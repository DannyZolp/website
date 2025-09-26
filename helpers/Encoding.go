package helpers

import (
	"compress/gzip"
	"fmt"
	"net"
	"strings"

	"github.com/andybalholm/brotli"
)

type Encoding int

const (
	Brotli Encoding = iota
	GZIP
	None
)

func WriteWithBrotli(c net.Conn, input []byte) {
	bWriter := brotli.NewWriter(c)
	bWriter.Write(input)
	bWriter.Flush()
	bWriter.Close()
	c.Close()
}

func WriteWithGZIP(c net.Conn, input []byte, includeCarriageReturn bool) {
	buf := new(strings.Builder)
	gWriter := gzip.NewWriter(buf)
	gWriter.Write(input)
	gWriter.Close()

	if includeCarriageReturn {
		c.Write([]byte(fmt.Sprintf("Content-Length: %d\r\n\r\n", len(buf.String()))))
	} else {
		c.Write([]byte(fmt.Sprintf("Content-Length: %d\n\n", len(buf.String()))))
	}
	c.Write([]byte(buf.String()))

	c.Close()
}
