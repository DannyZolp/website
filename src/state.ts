import { type Menu } from "./menus/helpers";

/// MENU
var currentMenu: Menu = "/";

export function getCurrentMenu() {
  return currentMenu;
}

export function setCurrentMenu(newMenu: Menu) {
  currentMenu = newMenu;
}

/// BUSY
var busy = false;

export function setBusy() {
  busy = true;
}

export function setFree() {
  busy = false;
}

export function isBusy() {
  return busy;
}
