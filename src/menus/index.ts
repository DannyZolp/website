import type { Terminal } from "@xterm/xterm";
import { printBlob } from "../printHelpers";
import { setBusy, setCurrentMenu, setFree } from "../state";
import { writeMenuPrompt } from "./helpers";

export async function handleMainMenuCommand(term: Terminal, command: string) {
  switch (command) {
    case "S":
    case "s":
      // show social media prompt
      term.write("S\r\n\n");
      await printBlob(term, "social-media");
      writeMenuPrompt(term, "/");
      break;
    case "R":
    case "r":
      // open resume
      term.write("R\r\n\n");
      window.open("/resume.pdf", "_blank");
      writeMenuPrompt(term, "/");
      break;
    case "G":
    case "g":
      term.write("G\r\n");
      await printBlob(term, "guestbook-menu");
      writeMenuPrompt(term, "/guestbook");
      return setCurrentMenu("/guestbook");
    case "P":
    case "p":
      term.write("P\r\n\n");
      window.open("https://portfolio.dannyzolp.com/", "_blank");
      writeMenuPrompt(term, "/");
      break;
    case "Q":
    case "q":
    case "\x03":
      term.write("Q\r\n\n");
      term.write("Goodbye\r\n\x1b[0mConnection closed by foreign host.");
      return setBusy();
    case "?":
      term.write("?\r\n");
      setBusy();
      printBlob(term, "main-menu").then(() => {
        writeMenuPrompt(term, "/");
        setFree();
      });
      break;
  }
}
