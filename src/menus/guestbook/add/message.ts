import type { Terminal } from "@xterm/xterm";
import { setCurrentMenu } from "../../../state";
import { clearEntryName, getEntryName } from "./name";
import axios from "axios";
import { writeMenuPrompt } from "../../helpers";

var message = "";

// 33.6kbps upload for V90 modems, times 1000 for bps, divide by 8 for bytes per second,
// divide by 1000 for bytes per millisecond, invert to get milliseconds per byte
const uploadMillisecondsPerByte = 1 / ((33.6 * 1000) / 8 / 1000);

export function handleGuestbookEnterMessage(term: Terminal, key: string) {
  if (key === "\x7f") {
    // backspace
    if (message.length > 0) {
      message = message.slice(0, -1);
      term.write("\x08 \x08");
    }
  } else if (key === "\r") {
    // enter
    term.write("\r\n    Uploading...");

    const submission = {
      n: getEntryName(),
      m: getEntryMessage(),
    };

    const body = JSON.stringify(submission);

    setTimeout(() => {
      axios
        .post("/guestbook", submission)
        .then(({ data: success }) => {
          if (success) {
            term.write("\r\n    Added guestbook entry!\r\n\n");
          } else {
            term.write("\r\n    Failed to add guestbook entry.\r\n\n");
          }

          setCurrentMenu("/guestbook");
          writeMenuPrompt(term, "/guestbook");
        })
        .catch(() => {
          term.write("\r\n    Error communicating with server.\r\n\n");
          setCurrentMenu("/guestbook");
          writeMenuPrompt(term, "/guestbook");
        })
        .finally(() => {
          clearEntryMessage();
          clearEntryName();
        });
    }, body.length * uploadMillisecondsPerByte);
  } else {
    message += key.charAt(0);
    term.write(key);
  }
}

export function getEntryMessage() {
  return message;
}

export function clearEntryMessage() {
  message = "";
}
