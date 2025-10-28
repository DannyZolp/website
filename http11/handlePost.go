package http11

import (
	"bufio"
	"container/list"
	"net"
	"strings"

	"github.com/DannyZolp/website/guestbook"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

func handlePost(c net.Conn, reader *bufio.Reader, request list.List, path string, db *gorm.DB, span trace.Span) {
	if strings.HasPrefix(path, "/guestbook") {
		span.AddEvent("Adding guestbook entry")
		guestbook.AddGuestbookEntry(db, c, reader, span)
		span.End()
	} else {
		notFound(c)
		span.End()
	}
}
