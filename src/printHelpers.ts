import type { Terminal } from "@xterm/xterm";
import guestbookMenu from "./blobs/guestbook-menu.txt?raw";
import logo from "./blobs/logo.txt?raw";
import mainMenu from "./blobs/main-menu.txt?raw";
import socialMedia from "./blobs/social-media.txt?raw";
import type { GuestbookEntry } from "./menus/guestbook/view";

type Blob = "main-menu" | "social-media" | "guestbook-menu" | "logo";

const MODEM_BAUD_RATE = 56_000;
const BITS_PER_CHARACTER = 10; // 8 data bits, plus start and stop bits (8-N-1)
const CHARACTERS_PER_MILLISECOND = MODEM_BAUD_RATE / BITS_PER_CHARACTER / 1_000;

function nextAnimationFrame() {
  return new Promise<number>((resolve) => requestAnimationFrame(resolve));
}

export async function printWithModemDelay(term: Terminal, lines: string[]) {
  const text = lines.join("\r\n");
  const startedAt = performance.now();
  let charactersWritten = 0;

  while (charactersWritten < text.length) {
    const now = await nextAnimationFrame();
    const charactersDue = Math.min(
      text.length,
      Math.floor((now - startedAt) * CHARACTERS_PER_MILLISECOND),
    );

    if (charactersDue > charactersWritten) {
      term.write(text.slice(charactersWritten, charactersDue));
      charactersWritten = charactersDue;
    }
  }
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
