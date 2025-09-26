package main

import (
	"bufio"
	"container/list"
	"fmt"
	"log"
	"net"
	"os"
	"strings"

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

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	generateCachedFiles()

	db = guestbook.OpenDatabase()

	l, err := net.Listen("tcp", ":8080")
	if err != nil {
		log.Fatal(err)
	}
	defer l.Close()

	for {
		c, err := l.Accept()
		if err != nil {
			fmt.Println(err)
			return
		}
		go handleConnection(c)
	}
}

func handleConnection(c net.Conn) {
	reader := bufio.NewReader(c)
	request := list.New()

	for {
		msg, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println(err)
			continue
		}

		if msg == "\r\n" {
			break
		} else {
			request.PushBack(strings.Trim(msg, "\r\n"))
		}
	}

	if strings.Contains(request.Front().Value.(string), "HTTP/1.1") {
		http11.HandleRequest(c, reader, *request, cachedFiles, db)
	} else if strings.Contains(request.Front().Value.(string), "HTTP/1.0") {
		http10.HandleRequest(c, cachedFiles)
	} else {
		c.Close()
	}

}
