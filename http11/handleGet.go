package http11

import (
	"container/list"
	"net"
	"strings"
)

func handleGet(c net.Conn, request list.List, path string) {
	var host string
	var encoding helpers.Encoding

	for e := request.Front(); e != nil; e = e.Next() {
		if strings.HasPrefix(e.Value.(string), "Host: ") {
			after, _ := strings.CutPrefix(e.Value.(string), "Host: ")
			host = after
		} else if strings.HasPrefix(e.Value.(string), "Accept-Encoding: ") {
			if strings.Contains(e.Value.(string), "br") {
				encoding = Brotli
			} else if strings.Contains(e.Value.(string), "gzip") {
				encoding = GZIP
			} else {
				encoding = None
			}
		}
	}

	c.Close()
}
