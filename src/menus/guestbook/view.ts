import type { Terminal } from "@xterm/xterm";
import { setBusy, setCurrentMenu, setFree } from "../../state";
import { writeMenuPrompt } from "../helpers";
import axios from "axios";
import { printGuestbookPage } from "../../printHelpers";

var currentPage = 0;
var lastPage = 0;

export type GuestbookEntry = {
  d: string; // date
  n: string; // name
  m: string; // message
};

export async function getAndPrintGuestbook(term: Terminal) {
  try {
    const { data } = await axios.get("/guestbook", {
      params: {
        p: currentPage,
      },
    });

    lastPage = Number.parseInt(data.l);
    currentPage = Number.parseInt(data.p);
    const entries = JSON.parse(data.d) as GuestbookEntry[];

    await printGuestbookPage(term, entries, currentPage, lastPage);
    writeMenuPrompt(term, "/guestbook/view");
  } catch (e) {
    term.write(
      "    Guestbook unavailable: unable to communicate with server.\r\n\n",
    );
    setCurrentMenu("/guestbook");
    writeMenuPrompt(term, "/guestbook");

    throw e;
  }
}

export function handleGuestbookViewMenuCommand(
  term: Terminal,
  command: string,
) {
  switch (command) {
    case "F":
    case "f":
      if (currentPage < lastPage) {
        // next page
        term.write("F\r\n");
        currentPage++;
        setBusy();
        getAndPrintGuestbook(term).then(() => {
          setFree();
        });
      }
      break;
    case "D":
    case "d":
      // last page
      if (currentPage > 0) {
        // next page
        term.write("D\r\n");
        currentPage--;
        setBusy();
        getAndPrintGuestbook(term).then(() => {
          setFree();
        });
      }
      break;
    case "Q":
    case "q":
    case "\x03":
      // go back to guestbook menu
      term.write("Q\r\n\n");
      writeMenuPrompt(term, "/guestbook");
      return setCurrentMenu("/guestbook");
  }
}
