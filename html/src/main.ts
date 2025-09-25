import { Terminal } from "@xterm/xterm";
import { activateTelnet } from "./logic";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { FitAddon } from "@xterm/addon-fit";

import "@xterm/xterm/css/xterm.css";
import "./main.css";

var term = new Terminal({
  cursorBlink: true,
});

function activateLink(_event: MouseEvent, uri: string) {
  window.open(uri, "_blank");
}

/* Detect links because of URL patterns. */
let webLinksAddon = new WebLinksAddon(activateLink);

let fitAddon = new FitAddon();

term.loadAddon(fitAddon);
term.loadAddon(webLinksAddon);

term.open(document.getElementById("terminal") as HTMLElement);

fitAddon.fit();

activateTelnet(term);
