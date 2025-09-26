package http11

import (
	"bufio"
	"container/list"
	"net"
	"strings"

	"github.com/DannyZolp/website/guestbook"
	"gorm.io/gorm"
)

func handlePost(c net.Conn, reader *bufio.Reader, request list.List, path string, db *gorm.DB) {
	if strings.HasPrefix(path, "/guestbook") {
		guestbook.AddGuestbookEntry(db, c, reader)
	} else {
		badRequest(c)
	}
}
