package main

import (
	"fmt"
	"net"
	"os"
	"sync"
	"time"
)

func handleTelnetConnection(c net.Conn) {
	// reader := bufio.NewReader(c)
	c.Write([]byte("\x1b[36;1m      +++++>.                                           \x1b[35;1m<<<<<<<          //\n\r"))
	time.Sleep((80 * 7 * time.Second / 56000))
	c.Write([]byte("\x1b[36;1m     .(     (_  .>=>>.<- <.<++<_  <.<<<<_ ..     <        \x1b[35;1m_/<  _.<<<.   (  <_-<><_\n\r"))
	time.Sleep((80 * 7 * time.Second / 56000))
	c.Write([]byte("\x1b[36;1m     ()      (>.(    (( .(<    (  (/    (  (   _(        \x1b[35;1m</   /<    \\) .( /(     ()\n\r"))
	time.Sleep((80 * 7 * time.Second / 56000))
	c.Write([]byte("\x1b[36;1m     (-     .( (>     /( (/    .( ((     (  () /)       \x1b[35;1m.(    (/     _( (< (      /(\n\r"))
	time.Sleep((80 * 7 * time.Second / 56000))
	c.Write([]byte("\x1b[36;1m    )(   _.+/  (\\   _/(> (     (/ (-    ()   ((/      \x1b[35;1m_/<     (<    .(  ( .(\\   _<)\n\r"))
	time.Sleep((80 * 7 * time.Second / 56000))
	c.Write([]byte("\x1b[36;1m    \\<<<(\\       \\<<\\ <  <     <  <     -    (<       \x1b[35;1m-------    --     - (> ---\n\r"))
	time.Sleep((80 * 7 * time.Second / 56000))
	c.Write([]byte("\x1b[36;1m                                           _(                             \x1b[35;1m(\r\n\n"))
	// for {
	// 	msg, err := reader.ReadString('\n')
	// }
}

func telnet(wg *sync.WaitGroup) {
	defer wg.Done()

	telnetServer, err := net.Listen("tcp", fmt.Sprintf(":%s", os.Getenv("TELNET_PORT")))
	if err != nil {
		panic(err)
	}
	defer telnetServer.Close()

	for {
		c, err := telnetServer.Accept()
		if err != nil {
			c.Close()
			return
		}
		go handleTelnetConnection(c)
	}
}
