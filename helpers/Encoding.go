package helpers

import (
	"compress/gzip"
	"net"

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

func WriteWithGZIP(c net.Conn, input []byte) {
	gWriter := gzip.NewWriter(c)
	gWriter.Write(input)
	gWriter.Close()
	c.Close()
}
