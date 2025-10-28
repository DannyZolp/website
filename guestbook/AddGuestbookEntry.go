package guestbook

import (
	"bufio"
	"context"
	"encoding/json"
	"net"
	"time"

	"github.com/DannyZolp/website/helpers"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

func AddGuestbookEntry(db *gorm.DB, c net.Conn, reader *bufio.Reader, span trace.Span) {
	ctx := context.Background()

	body := json.NewDecoder(reader)
	var entry CreateEntry
	body.Decode(&entry)

	err := gorm.G[Entry](db).Create(ctx, &Entry{Name: entry.Name, Message: entry.Message, Date: time.Now().Format("Mon, Jan 01 2006"), IP: c.LocalAddr().String()})

	if err != nil {
		span.SetStatus(codes.Error, "500")
		span.RecordError(err)
		c.Close()
		return
	}

	c.Write([]byte("HTTP/1.0 200 OK\n"))
	c.Write([]byte("Date: " + helpers.GetDate() + "\n"))
	c.Write([]byte("Server: github.com/DannyZolp/http\n"))
	c.Write([]byte("Content-Type: application/json\n"))
	c.Write([]byte("Content-Length: 4\n\n"))
	c.Write([]byte("\"OK\""))
	c.Close()
}
