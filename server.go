package main

import (
	"bufio"
	"container/list"
	"fmt"
	"log"
	"net"
	"os"
	"strings"

	http10 "github.com/DannyZolp/website/http10"
	http11 "github.com/DannyZolp/website/http11"
)

var cachedFiles map[string][]byte

func generateCachedFiles() {
	cachedFiles = make(map[string][]byte)

	// index.html
	index, err := os.ReadFile("./public/index.html")
	if err != nil {
		log.Fatal(err)
	}
	cachedFiles["/"] = index

}

func main() {
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
			request.PushBack(msg)
		}
	}

	if strings.Contains(request.Front().Value.(string), "HTTP/1.1") {
		http11.HandleRequest(c, *request)
	} else if strings.Contains(request.Front().Value.(string), "HTTP/1.0") {
		http10.HandleRequest(c)
	} else {
		c.Close()
	}

}
