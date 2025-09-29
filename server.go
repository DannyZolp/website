package main

import (
	"bufio"
	"container/list"
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"os"
	"strings"
	"sync"

	"github.com/DannyZolp/website/guestbook"
	"github.com/DannyZolp/website/http10"
	"github.com/DannyZolp/website/http11"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

var cachedFiles map[string][]byte
var db *gorm.DB

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

func handleConnection(c net.Conn) {
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
		c.Close()
		return
	}

	if strings.Contains(request.Front().Value.(string), "HTTP/1.1") {
		http11.HandleRequest(c, reader, *request, cachedFiles, db)
	} else if strings.Contains(request.Front().Value.(string), "HTTP/1.0") {
		http10.HandleRequest(c, reader, *request, cachedFiles, db)
	} else {
		c.Close()
	}
}

func listen(l net.Listener, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		c, err := l.Accept()
		if err != nil {
			c.Close()
			return
		}
		go handleConnection(c)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

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

	go listen(http, &wg)
	go listen(https, &wg)

	wg.Wait()

}
