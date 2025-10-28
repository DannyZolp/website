package main

import (
	"bufio"
	"container/list"
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/DannyZolp/website/guestbook"
	"github.com/DannyZolp/website/http10"
	"github.com/DannyZolp/website/http11"
	"github.com/joho/godotenv"
	"gorm.io/gorm"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"go.opentelemetry.io/otel/trace"
)

var cachedFiles map[string][]byte
var db *gorm.DB
var tracer trace.Tracer

func newTracerProvider(exp sdktrace.SpanExporter) *sdktrace.TracerProvider {
	// Ensure default SDK resources and the required service name are set.
	r, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("website"),
		),
	)

	if err != nil {
		panic(err)
	}

	return sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	)
}

func generateStructure(dir []os.DirEntry, sysPath string, webPath string) {
	for _, item := range dir {
		if item.IsDir() {
			subdir, _ := os.ReadDir(sysPath + item.Name())
			generateStructure(subdir, sysPath+item.Name()+"/", item.Name()+"/")
		} else {
			file, err := os.ReadFile(sysPath + item.Name())
			if err != nil {
				log.Fatal(err)
			}
			cachedFiles["/"+webPath+strings.Replace(item.Name(), ".html", "", 1)] = file
		}
	}
}

func generateCachedFiles() {
	cachedFiles = make(map[string][]byte)

	webroot, _ := os.ReadDir(os.Getenv("WEBROOT"))

	generateStructure(webroot, os.Getenv("WEBROOT"), "")

	// index.html
	index, err := os.ReadFile(os.Getenv("WEBROOT") + "index.html")
	if err != nil {
		log.Fatal(err)
	}
	cachedFiles["/"] = index
}

func handleConnection(c net.Conn, ctx context.Context) {
	_, span := tracer.Start(ctx, "request")

	reader := bufio.NewReader(c)
	request := list.New()

	for {
		msg, err := reader.ReadString('\n')
		if err != nil {
			c.Close()
			return
		}

		if msg == "\r\n" {
			break
		} else {
			request.PushBack(strings.Trim(msg, "\r\n"))
		}
	}

	if request.Front() == nil {
		span.AddEvent("Empty Request, closing")
		span.End()
		c.Close()
		return
	}

	front := request.Front().Value.(string)

	if strings.Contains(front, "HTTP/1.1") {
		span.AddEvent("HTTP Request Version 1.1")
		http11.HandleRequest(c, reader, *request, cachedFiles, db, span)
	} else if strings.Contains(front, "HTTP/1.0") {
		span.AddEvent("HTTP Request Version 1.0")
		http10.HandleRequest(c, reader, *request, cachedFiles, db, span)
	} else {
		span.AddEvent("Could not decode HTTP header, closing", trace.WithAttributes(attribute.String("method", front)))
		span.End()
		c.Close()
	}
}

func listen(l net.Listener, ctx context.Context, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		c, err := l.Accept()
		if err != nil {
			c.Close()
			return
		}
		go handleConnection(c, ctx)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	headers := map[string]string{
		"content-type": "application/json",
	}

	exporter, err := otlptrace.New(
		context.Background(),
		otlptracehttp.NewClient(
			otlptracehttp.WithEndpoint("192.168.64.2:4318"),
			otlptracehttp.WithHeaders(headers),
			otlptracehttp.WithInsecure(),
		),
	)
	if err != nil {
		panic(err)
	}

	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(
			exporter,
			sdktrace.WithMaxExportBatchSize(sdktrace.DefaultMaxExportBatchSize),
			sdktrace.WithBatchTimeout(sdktrace.DefaultScheduleDelay*time.Millisecond),
			sdktrace.WithMaxExportBatchSize(sdktrace.DefaultMaxExportBatchSize),
		),
		sdktrace.WithResource(
			resource.NewWithAttributes(
				semconv.SchemaURL,
				semconv.ServiceNameKey.String("website"),
			),
		),
	)

	defer func() {
		if err := tracerProvider.Shutdown(ctx); err != nil {
			panic(err)
		}
	}()
	otel.SetTracerProvider(tracerProvider)

	tracer = tracerProvider.Tracer("github.com/dannyzolp/website")

	generateCachedFiles()

	db = guestbook.OpenDatabase()

	http, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("HTTP_PORT")))
	if err != nil {
		log.Fatal(err)
	}
	defer http.Close()

	cert, err := tls.LoadX509KeyPair(os.Getenv("CERT"), os.Getenv("KEY"))
	if err != nil {
		log.Fatal(err)
	}

	https, err := tls.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("HTTPS_PORT")), &tls.Config{Certificates: []tls.Certificate{cert}})
	if err != nil {
		log.Fatal(err)
	}
	defer https.Close()

	fmt.Println("Listening for http and https requests...")

	var wg sync.WaitGroup
	wg.Add(4)

	go listen(http, ctx, &wg)
	go listen(https, ctx, &wg)

	wg.Wait()

}
