import { Terminal } from "@xterm/xterm";
import { setBusy, setCurrentMenu, setFree } from "../../state";
import { writeMenuPrompt } from "../helpers";
import { printBlob } from "../../printHelpers";
import { getAndPrintGuestbook } from "./view";

export function handleGuestbookMenuCommand(term: Terminal, command: string) {
  switch (command) {
    case "V":
    case "v":
      term.write("V\r\n\n");
      setBusy();
      getAndPrintGuestbook(term).then(() => {
        setCurrentMenu("/guestbook/view");
        setFree();
      });
      break;
    case "A":
    case "a":
      term.write("A\r\n");
      writeMenuPrompt(term, "/guestbook/add/name");
      return setCurrentMenu("/guestbook/add/name");
    case "Q":
    case "q":
    case "\x03":
      term.write("Q\r\n\n");
      writeMenuPrompt(term, "/");
      return setCurrentMenu("/");
    case "?":
      term.write("?\r\n");
      setBusy();
      printBlob(term, "guestbook-menu").then(() => {
        writeMenuPrompt(term, "/guestbook");
        setFree();
      });
      break;
  }
}
