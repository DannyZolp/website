import type { Terminal } from "@xterm/xterm";
import {
  header,
  socialMedia,
  resume,
  resumeMenu,
  guestbookMenu,
  guestbookPage,
} from "./menus.ts";

async function printWithModemDelay(array: (() => void)[]) {
  return new Promise((res, _rej) => {
    const delay = ((80 * 7) / 56000) * 1000;
    var line = 0;
    const print = setInterval(() => {
      if (line < array.length) {
        array[line]();
        line++;
      }
    }, delay);

    setTimeout(() => {
      clearInterval(print);
      res(true);
    }, delay * array.length + 500);
  });
}

function writeHeader(term: Terminal) {
  const h = header(term);
  printWithModemDelay(h).then(() => {
    enableKeyboard(term);
  });
}

var menu = "main";
var guestbookPageNumber = 0;
var typingMessageToSysop = false;
var sysopMsg = "";

function mainMenuCommand(cmd: string, term: Terminal) {
  if (cmd === "S" || cmd === "s") {
    term.write("S\r\n");
    const sm = socialMedia(term);
    printWithModemDelay(sm);
  } else if (cmd === "R" || cmd === "r") {
    term.write("R\r\n\n");
    menu = "resume";
    const rm = resumeMenu(term);
    printWithModemDelay(rm);
  } else if (cmd === "G" || cmd === "g") {
    term.write("G\r\n\n");
    menu = "guestbook";
    const gm = guestbookMenu(term);
    printWithModemDelay(gm);
  } else if (cmd === "P" || cmd === "p") {
    term.write("P\r\n\n")
    window.open("https://portfolio.dannyzolp.com/", "_blank");
    term.write("Main Menu> ");
  } else if (cmd === "Q" || cmd === "q") {
    term.write("Q\r\n\nGoodbye\r\n\x1b[0mConnection closed by foreign host.");
    menu = "dead";
  }
}

function resumeMenuCommand(cmd: string, term: Terminal) {
  if (cmd === "T" || cmd === "t") {
    term.write("T\r\n");

    resume(term).then((h) => {
      printWithModemDelay(h).then(() => {
        menu = "main";
        term.write("Main Menu> ");
      });
    });
  } else if (cmd === "P" || cmd === "p") {
    term.write("P\r\n");
    window.open("/resume.pdf", "_blank");
    menu = "main";
    term.write("Main Menu> ");
  } else if (cmd === "B" || cmd === "b") {
    term.write("B\r\n");
    menu = "main";
    term.write("Main Menu> ");
  }
}

var viewingGuestbook = false;
var typingName = false;
var typingMessage = false;
var name = "";
var message = "";

function guestbookMenuCommand(cmd: string, term: Terminal) {
  if (typingName) {
    if (cmd === "\r") {
      typingName = false;
      term.write("\r\nWhat is your message? ");
      typingMessage = true;
    } else if (cmd === "\x7f") {
      if (name.length > 0) {
        name = name.slice(0, -1);
        term.write("\x08 \x08");
      }
    } else if (cmd.charCodeAt(0) === 3) {
      name = "";
      message = "";
      typingName = false;
      term.write("^C\r\n\nGuestbook> ");
    } else {
      if (name.length < 100) {
        term.write(cmd);
        name += cmd;
      }
    }
  } else if (typingMessage) {
    if (cmd === "\r") {
      typingMessage = false;

      fetch("/guestbook", {
        method: "POST",
        body: JSON.stringify({
          name,
          message,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res === "OK") {
            term.write("\r\nAdded to guestbook!\r\n\nGuestbook> ");
          } else {
            term.write(
              "\r\nThere was an error adding you to the guestbook.\r\n\nGuestbook> "
            );
          }
        })
        .catch(() => {
          term.write(
            "\r\nThere was an error adding you to the guestbook.\r\n\nGuestbook> "
          );
        });
    } else if (cmd === "\x7f") {
      if (message.length > 0) {
        message = message.slice(0, -1);
        term.write("\x08 \x08");
      }
    } else if (cmd.charCodeAt(0) === 3) {
      name = "";
      message = "";
      typingMessage = false;
      term.write("^C\r\n\nGuestbook> ");
    } else {
      if (message.length < 100) {
        term.write(cmd);
        message += cmd;
      }
    }
  } else if (cmd === "V" || cmd === "v") {
    term.write("V\r\n\n");
    viewingGuestbook = true;
    guestbookPageNumber = 0;
    fetch(`/guestbook/${guestbookPageNumber}`)
      .then((r) => r.json())
      .then((page) => {
        printWithModemDelay(guestbookPage(term, page)).then(() => {
          term.write("\nType N for next page\r\n\nGuestbook> ");
        });
      });
  } else if ((cmd === "N" || cmd === "n") && viewingGuestbook) {
    term.write("N\r\n\n");
    guestbookPageNumber++;
    fetch(`/guestbook/${guestbookPageNumber}`)
      .then((r) => r.json())
      .then((page) => {
        printWithModemDelay(guestbookPage(term, page)).then(() => {
          term.write("\nType N for next page\r\n\nGuestbook> ");
        });
      })
      .catch(() => {
        term.write("There are no more entries.\r\n\nGuestbook> ");
        viewingGuestbook = false;
      });
  } else if (cmd === "A" || cmd === "a") {
    term.write("A\r\n\nWhat is your name? (Ctrl+C to cancel) ");
    typingName = true;
  } else if (cmd === "B" || cmd === "b") {
    term.write("B\r\n");
    menu = "main";
    term.write("Main Menu> ");
  }
}

function enableKeyboard(term: Terminal) {
  term.onKey((e) => {
    if (menu === "resume") {
      resumeMenuCommand(e.key, term);
    } else if (menu === "main") {
      mainMenuCommand(e.key, term);
    } else if (menu === "guestbook") {
      guestbookMenuCommand(e.key, term);
    }
  });
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

var hostname =
  "hv0" + getRandomInt(2) + "vm" + getRandomInt(10).toString().padStart(2, "0");

export function activateTelnet(term: Terminal) {
  if (navigator.userAgent.indexOf("Win") > 0) {
    // windows environment, mimic powershell
    term.write("PS C:\\Users\\danny> telnet dannyzolp.com\n\r");
    term.write("Connecting to dannyzolp.com...\n\r");
    setTimeout(() => {
      term.clear();
      writeHeader(term);
    }, 500);
  } else if (navigator.userAgent.indexOf("Mac") > 0) {
    // macos environment, mimic zsh
    term.write("danny@Mac ~ % telnet dannyzolp.com\n\r");
    term.write("Trying 66.42.119.96...\n\r");
    setTimeout(() => {
      term.write("Connected to dannyzolp.com.\n\r");
      term.write("Escape character is '^]'.\n\r");
      writeHeader(term);
    }, 500);
  } else {
    // use a generic bash environment for unix/linux
    term.write("danny@" + hostname + ":~$ telnet dannyzolp.com\n\r");
    term.write("Trying 66.42.119.96...\n\r");
    setTimeout(() => {
      term.write("Connected to dannyzolp.com.\n\r");
      term.write("Escape character is '^]'.\n\r");
      writeHeader(term);
    }, 500);
  }
}
