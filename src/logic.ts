import type { Terminal } from "@xterm/xterm";
import { printBlob } from "./printHelpers";
import { isBusy as isBusy, getCurrentMenu } from "./state";
import { handleMainMenuCommand } from "./menus";
import { handleGuestbookMenuCommand } from "./menus/guestbook";
import { handleGuestbookEnterName } from "./menus/guestbook/add/name";
import { handleGuestbookEnterMessage } from "./menus/guestbook/add/message";
import { handleGuestbookViewMenuCommand } from "./menus/guestbook/view";
import { writeMenuPrompt } from "./menus/helpers";

function writeHeader(term: Terminal) {
  printBlob(term, "logo").then(() => {
    printBlob(term, "main-menu").then(() => {
      writeMenuPrompt(term, "/");
      enableKeyboard(term);
    });
  });
}

function enableKeyboard(term: Terminal) {
  term.onKey((e) => {
    if (isBusy()) return;

    switch (getCurrentMenu()) {
      case "/":
        return handleMainMenuCommand(term, e.key);
      case "/guestbook":
        return handleGuestbookMenuCommand(term, e.key);
      case "/guestbook/add/name":
        return handleGuestbookEnterName(term, e.key);
      case "/guestbook/add/message":
        return handleGuestbookEnterMessage(term, e.key);
      case "/guestbook/view":
        return handleGuestbookViewMenuCommand(term, e.key);
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
