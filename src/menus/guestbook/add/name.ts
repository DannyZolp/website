import type { Terminal } from "@xterm/xterm";
import { setCurrentMenu } from "../../../state";
import { writeMenuPrompt } from "../../helpers";

var name = "";

export function handleGuestbookEnterName(term: Terminal, key: string) {
  if (key === "\x7f") {
    // backspace
    if (name.length > 0) {
      name = name.slice(0, -1);
      term.write("\x08 \x08");
    }
  } else if (key === "\r") {
    // enter
    term.write("\r\n");
    writeMenuPrompt(term, "/guestbook/add/message");
    setCurrentMenu("/guestbook/add/message");
  } else if (key === "\x03") {
    term.write("^C\r\n");
    setCurrentMenu("/guestbook");
    writeMenuPrompt(term, "/guestbook");
  } else {
    name += key.charAt(0);
    term.write(key);
  }
}

export function getEntryName() {
  return name;
}

export function clearEntryName() {
  name = "";
}
