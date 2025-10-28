package guestbook

import (
	"context"
	"encoding/json"
	"fmt"
	"net"

	"github.com/DannyZolp/website/helpers"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
)

func GetGuestbookPage(db *gorm.DB, pageNumber int, c net.Conn, span trace.Span) {
	ctx := context.Background()

	startId := pageNumber * 5

	dbEntries, err := gorm.G[Entry](db).Where("id BETWEEN ? AND ?", startId, startId+5).Find(ctx)

	ctx.Done()

	if err != nil {
		span.SetStatus(codes.Error, "Error reading from database")
		span.RecordError(err)
		c.Close()
		span.End()
		return
	}

	max := 5

	if len(dbEntries) < 5 {
		max = len(dbEntries)
	}

	entries := make([]EntryResponse, max)

	for i := 0; i < max; i++ {
		entries[i] = EntryResponse{
			Name:    dbEntries[i].Name,
			Message: dbEntries[i].Message,
			Date:    dbEntries[i].Date,
		}
	}

	response, _ := json.Marshal(entries)

	c.Write([]byte("HTTP/1.0 200 OK\n"))
	c.Write([]byte("Date: " + helpers.GetDate() + "\n"))
	c.Write([]byte("Server: github.com/DannyZolp/http\n"))
	c.Write([]byte("Content-Type: application/json\n"))
	c.Write([]byte(fmt.Sprintf("Content-Length: %d\n\n", len(response))))
	c.Write(response)

	span.AddEvent("Request sent!", trace.WithAttributes(attribute.String("body", string(response))))

	c.Close()
}
