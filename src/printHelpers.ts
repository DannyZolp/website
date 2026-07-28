import type { Terminal } from "@xterm/xterm";
import guestbookMenu from "./blobs/guestbook-menu.txt?raw";
import logo from "./blobs/logo.txt?raw";
import mainMenu from "./blobs/main-menu.txt?raw";
import socialMedia from "./blobs/social-media.txt?raw";
import type { GuestbookEntry } from "./menus/guestbook/view";

type Blob = "main-menu" | "social-media" | "guestbook-menu" | "logo";

export async function printWithModemDelay(term: Terminal, lines: string[]) {
  const delay = ((80 * 7) / 56000) * 1000;

  return new Promise((res, _rej) => {
    for (let i = 0; i < lines.length; i++) {
      setTimeout(() => term.write(lines[i] + "\r\n"), delay * (i + 1));
    }

    setTimeout(
      () => {
        res(true);
      },
      delay * lines.length + 250,
    );
  });
}

function getTextBlob(blob: Blob) {
  switch (blob) {
    case "main-menu":
      return mainMenu;
    case "guestbook-menu":
      return guestbookMenu;
    case "social-media":
      return socialMedia;
    case "logo":
      return logo;
  }
}

export async function printBlob(term: Terminal, blob: Blob) {
  const text = getTextBlob(blob).replaceAll("\\x1b", "\x1b");

  const lines = text.split("\n");

  await printWithModemDelay(term, lines);

  term.write("\r\n");
}

export async function printGuestbookPage(
  term: Terminal,
  entries: GuestbookEntry[],
  pageNumber: number,
  lastPage: number,
) {
  await printWithModemDelay(term, [
    `\r\n\n    =================================== Page ${pageNumber} ${"=".repeat(35 - pageNumber.toString().length)}`,
    ...entries.map((e) => {
      if (e.m.length <= 0) {
        e.m = "\x1b[0m\x1b[3m<no message>\x1b[0m";
      }

      return `    [${e.d}] ${e.n}: ${e.m}\r\n`;
    }),
    `\r\n\x1b[1m    ${pageNumber > 0 ? "< D" : "   "}${" ".repeat(82 - 4 - 6)}${pageNumber < lastPage ? "F >" : "   "}\r\n`,
  ]);
}
