// Pony Terminal main.js

let source = "",
    speed = 3,
    index = 0,
    altCount = 0,
    shiftCount = 0,
    overlayShown = false;

// === Element bindings ===
const typer = document.getElementById("pony-typer");
const cursor = document.getElementById("pony-cursor");
const overlay = document.getElementById("pony-overlay");
const main = document.getElementById("pony-main");
const footer = document.getElementById("pony-footer");
const menu = document.getElementById("pony-menu");

const bottom_padding = document.getElementById("pony-bottom-padding");
const theme_color_input = document.getElementById("pony-theme-color");
const speed_input = document.getElementById("pony-speed-input");
const speed_range = document.getElementById("pony-speed-range");
const font_size_input = document.getElementById("pony-fontsize-input");
const font_size_range = document.getElementById("pony-fontsize-range");
const font_select = document.getElementById("pony-font-select");
const file_row = document.getElementById("pony-file-row");
const hidden_text = document.getElementById("pony-hidden-text");
const font_div = document.getElementById("pony-font-div");

// Alerts / modals
const granted = document.getElementById("pony-granted");
const denied = document.getElementById("pony-denied");

// === Storage helpers ===
function getFromStore(key, fallback) {
  if (!localStorage) return fallback;
  let val = localStorage.getItem(key);
  return val === null ? fallback : val;
}
function setStore(key, val) {
  if (localStorage) localStorage.setItem(key, val);
}

// === Typing cursor ===
function toggleCursor() {
  cursor.style.color =
    cursor.style.color === "transparent" ? "inherit" : "transparent";
}

// === Keyboard events ===
function onKey(e) {
  if (e.key === "Escape") hideOverlay();
  if (overlayShown) return;

  if (e.key === "Shift") shiftCount++;
  if (e.key === "Alt") altCount++;

  if (altCount >= 3) {
    altCount = 0;
    showAlert(granted);
  }
  if (shiftCount >= 3) {
    shiftCount = 0;
    showAlert(denied);
  }

  type(speed);
}

function type(amount) {
  let chunk = source
    .substring(index, index + amount)
    .replace(/[\u00A0-\u9999<>\&]/gim, (c) => `&#${c.charCodeAt(0)};`);
  typer.innerHTML += chunk;
  index += amount;
  bottom_padding.scrollIntoView(false);
}

// === Source loading ===
function fetchSource() {
  fetch("./kernel.txt")
    .then((res) => res.text())
    .then((text) => {
      index = 0;
      typer.innerHTML = "";
      setStore("source", text);
      source = text;
    });
}

function onFileChange(files) {
  if (files.length < 1) return;
  let reader = new FileReader();
  reader.onload = function (e) {
    source = e.target.result;
    setStore("source", source);
    typer.innerHTML = "";
    index = 0;
  };
  reader.readAsText(files[0], "utf8");
}

// === Settings ===
function onColorChange() {
  if (/#[a-f0-9]{3,9}/i.test(theme_color_input.value))
    setThemeColor(theme_color_input.value);
}
function onSpeedChange(e) {
  if (!/\d+/.test(e.target.value)) return;
  let v = parseInt(e.target.value);
  if (v < speed_range.min || v > speed_range.max) return;
  speed_range.value = v;
  speed_input.value = v;
  speed = v;
  setStore("speed", v);
}
function onFontSizeChange(e) {
  if (!/\d+/.test(e.target.value)) return;
  let v = parseInt(e.target.value);
  if (v < font_size_range.min || v > font_size_range.max) return;
  font_size_range.value = v;
  font_size_input.value = v;
  setFontSize(v);
  setStore("font_size", v);
}
function onFontChange(e) {
  setFont(e.target.value);
  setStore("font", e.target.value);
}

function setDefaults() {
  speed = parseInt(getFromStore("speed", 3));
  speed_range.value = speed;
  speed_input.value = speed;

  const color = getFromStore("color", "#00ff00");
  theme_color_input.value = color;
  setThemeColor(color);

  const size = parseInt(getFromStore("font_size", 13));
  font_size_range.value = size;
  font_size_input.value = size;
  setFontSize(size);

  const font = getFromStore("font", "Courier");
  font_select.value = font;
  setFont(font);

  const saved = getFromStore("source", "");
  if (saved) {
    source = saved;
  } else {
    fetchSource();
  }
}

// === Style helpers ===
function chooseColor(c) {
  theme_color_input.value = c;
  setThemeColor(c);
}
function setThemeColor(c) {
  document.body.style.color = c;
  for (const el of document.querySelectorAll(".theme_border_color"))
    el.style.borderColor = c;
  for (const el of document.querySelectorAll(".theme_color")) el.style.color = c;
  for (const el of document.querySelectorAll(".theme_bg_color"))
    el.style.background = c;
  for (const el of document.querySelectorAll(".theme_fill_color"))
    el.style.fill = c;
  setStore("color", c);
}
function setFont(f) {
  const googleName = f.replace(/\s/, "+");
  font_div.innerHTML = `<link href="https://fonts.googleapis.com/css?family=${googleName}&display=swap" rel="stylesheet" />`;
  typer.style.fontFamily = f;
}
function setFontSize(s) {
  typer.style.fontSize = s + "px";
  cursor.style.fontSize = s + "px";
}

// === Overlay / modals ===
function showModal(el) {
  hideOverlay();
  showOverlay();
  el.style.display = "block";
}
function showAlert(el) {
  showOverlay();
  el.style.display = "block";
}
function showMenu() {
  showOverlay();
  menu.classList.add("visible");
}
function showOverlay() {
  overlayShown = true;
  overlay.style.display = "grid";
  footer.classList.add("blurred");
  main.classList.add("blurred");
}
function hideOverlay() {
  overlayShown = false;
  overlay.style.display = "none";
  menu.classList.remove("visible");
  footer.classList.remove("blurred");
  main.classList.remove("blurred");
  for (const el of document.querySelectorAll(".modal")) el.style.display = "none";
  for (const el of document.querySelectorAll(".alert")) el.style.display = "none";
}
function closeFooter() {
  footer.style.display = "none";
}

// === Bind events ===
function bindEvents() {
  setInterval(toggleCursor, 500);
  window.addEventListener("keydown", onKey);
  overlay.addEventListener("click", hideOverlay);

  for (const m of document.querySelectorAll(".modal"))
    m.addEventListener("click", (e) => e.stopPropagation());

  theme_color_input.addEventListener("keyup", onColorChange);
  speed_input.addEventListener("keyup", onSpeedChange);
  speed_range.addEventListener("change", onSpeedChange);
  font_size_input.addEventListener("keyup", onFontSizeChange);
  font_size_range.addEventListener("change", onFontSizeChange);
  font_select.addEventListener("change", onFontChange);

  menu.addEventListener("click", (e) => e.stopPropagation());
  hidden_text.addEventListener("focus", () => {
    hidden_text.classList.add("hidden");
  });
  main.addEventListener("click", () => hidden_text.focus());

  if (typeof window.FileReader !== "function")
    file_row.style.display = "none";
}

// === Init ===
window.addEventListener("DOMContentLoaded", () => {
  setDefaults();
  bindEvents();
});
