import type { Terminal } from "@xterm/xterm";

export type Menu =
  | "/"
  | "/guestbook"
  | "/guestbook/view"
  | "/guestbook/add/name"
  | "/guestbook/add/message";

export function writeMenuPrompt(term: Terminal, menu: Menu) {
  switch (menu) {
    case "/":
      return term.write("\x1b[0mMain Menu> ");
    case "/guestbook":
      return term.write("\x1b[0mGuestbook> ");
    case "/guestbook/view":
      return term.write("\x1b[0mGuestbook Pages> ");
    case "/guestbook/add/name":
      return term.write(
        "\r\n\x1b[0mType your name here, or press Ctrl+C to cancel> ",
      );
    case "/guestbook/add/message":
      return term.write("\r\n\x1b[0mType your message here> ");
  }
}
