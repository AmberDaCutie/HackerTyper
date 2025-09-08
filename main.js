// main.js 🦄 ponyfied + safe DOM load
window.addEventListener("DOMContentLoaded", () => {
  let source = "",
      speed = 3,
      index = 0,
      altCount = 0,
      shiftCount = 0,
      overlayShown = false;

  // Pony elements
  const ponyTyper = document.getElementById("pony-typer");
  const ponyCursor = document.getElementById("pony-cursor");
  const ponyBottomPadding = document.getElementById("pony-bottom-padding");
  const ponyFontDiv = document.getElementById("pony-font-div");
  const ponyOverlay = document.getElementById("pony-overlay");
  const ponyFooter = document.getElementById("pony-footer");
  const ponyMain = document.getElementById("pony-main");
  const ponyMenu = document.getElementById("pony-menu");
  const ponyHiddenText = document.getElementById("pony-hidden-text");
  const ponyFileRow = document.getElementById("pony-file-row");

  // Settings inputs
  const ponyThemeColor = document.getElementById("pony-theme-color");
  const ponySpeedInput = document.getElementById("pony-speed-input");
  const ponySpeedRange = document.getElementById("pony-speed-range");
  const ponyFontsizeInput = document.getElementById("pony-fontsize-input");
  const ponyFontsizeRange = document.getElementById("pony-fontsize-range");
  const ponyFontSelect = document.getElementById("pony-font-select");

  // Alerts
  const granted = document.getElementById("pony-access-granted");
  const denied = document.getElementById("pony-access-denied");

  // --- helpers ---
  function getFromStore(key, fallback) {
    if (!localStorage) return fallback;
    let val = localStorage.getItem(key);
    return val === null ? fallback : val;
  }
  function setStore(key, val) {
    if (localStorage) localStorage.setItem(key, val);
  }

  function toggleCursor() {
    ponyCursor.style.color = ponyCursor.style.color === "transparent" ? "inherit" : "transparent";
  }

  function onKey(e) {
    if (e.key === "Escape") hideOverlay();
    if (!overlayShown) {
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
  }

  function type(n) {
    let chunk = source.substring(index, index + n).replace(/[\u00A0-\u9999<>\&]/gim, ch => "&#" + ch.charCodeAt(0) + ";");
    ponyTyper.innerHTML += chunk;
    index += n;
    ponyBottomPadding.scrollIntoView(false);
  }

  function fetchSource() {
    fetch("./kernel.txt")
      .then(r => r.text())
      .then(txt => {
        index = 0;
        ponyTyper.innerHTML = "";
        setStore("source", txt);
        source = txt;
      });
  }

  function onColorChange() {
    if (/#[a-f0-9]{3,9}/.test(ponyThemeColor.value)) setThemeColor(ponyThemeColor.value);
  }

  function onSpeedChange(e) {
    if (/\d+/.test(e.target.value)) {
      let v = parseInt(e.target.value);
      if (v < ponySpeedRange.min || v > ponySpeedRange.max) return;
      ponySpeedRange.value = v;
      ponySpeedInput.value = v;
      speed = v;
      setStore("speed", v);
    }
  }

  function onFontSizeChange(e) {
    if (/\d+/.test(e.target.value)) {
      let v = parseInt(e.target.value);
      if (v < ponyFontsizeRange.min || v > ponyFontsizeRange.max) return;
      ponyFontsizeRange.value = v;
      ponyFontsizeInput.value = v;
      setFontSize(v);
      setStore("font_size", v);
    }
  }

  function onFontChange(e) {
    setFont(e.target.value);
    setStore("font", e.target.value);
  }

  function onFileChange(files) {
    if (files.length < 1) return;
    let reader = new FileReader();
    reader.onload = e => {
      source = e.target.result;
      setStore("source", source);
      ponyTyper.innerHTML = "";
      index = 0;
    };
    reader.readAsText(files[0], "utf8");
  }

  function setDefaults() {
    speed = parseInt(getFromStore("speed", 3));
    ponySpeedRange.value = speed;
    ponySpeedInput.value = speed;

    const color = getFromStore("color", "#00ff00");
    ponyThemeColor.value = color;
    setThemeColor(color);

    const size = parseInt(getFromStore("font_size", 13));
    ponyFontsizeRange.value = size;
    ponyFontsizeInput.value = size;
    setFontSize(size);

    const font = getFromStore("font", "Courier");
    ponyFontSelect.value = font;
    setFont(font);

    const storedSource = getFromStore("source", "");
    if (storedSource) {
      source = storedSource;
    } else {
      fetchSource();
    }
  }

  function chooseColor(c) {
    ponyThemeColor.value = c;
    setThemeColor(c);
  }

  function setThemeColor(c) {
    document.body.style.color = c;
    for (const el of document.querySelectorAll(".theme_border_color")) el.style.borderColor = c;
    for (const el of document.querySelectorAll(".theme_color")) el.style.color = c;
    for (const el of document.querySelectorAll(".theme_bg_color")) el.style.background = c;
    for (const el of document.querySelectorAll(".theme_fill_color")) el.style.fill = c;
    setStore("color", c);
  }

  function setFont(f) {
    const linkName = f.replace(/\s/, "+");
    ponyFontDiv.innerHTML = `<link href="https://fonts.googleapis.com/css?family=${linkName}&display=swap" rel="stylesheet" />`;
    ponyTyper.style.fontFamily = f;
  }

  function setFontSize(s) {
    ponyTyper.style.fontSize = s + "px";
    ponyCursor.style.fontSize = s + "px";
  }

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
    ponyMenu.classList.add("visible");
  }

  function showOverlay() {
    overlayShown = true;
    ponyOverlay.style.display = "grid";
    ponyFooter.classList.add("blurred");
    ponyMain.classList.add("blurred");
  }

  function hideOverlay() {
    overlayShown = false;
    ponyOverlay.style.display = "none";
    ponyMenu.classList.remove("visible");
    ponyFooter.classList.remove("blurred");
    ponyMain.classList.remove("blurred");
    for (const el of document.querySelectorAll(".modal")) el.style.display = "none";
    for (const el of document.querySelectorAll(".alert")) el.style.display = "none";
  }

  function closeFooter() {
    ponyFooter.style.display = "none";
  }

  function bindEvents() {
    setInterval(toggleCursor, 500);
    window.addEventListener("keydown", onKey);
    ponyOverlay.addEventListener("click", hideOverlay);
    for (const el of document.querySelectorAll(".modal")) el.addEventListener("click", e => e.stopPropagation());

    ponyThemeColor.addEventListener("keyup", onColorChange);
    ponySpeedInput.addEventListener("keyup", onSpeedChange);
    ponySpeedRange.addEventListener("change", onSpeedChange);
    ponyFontsizeInput.addEventListener("keyup", onFontSizeChange);
    ponyFontsizeRange.addEventListener("change", onFontSizeChange);
    ponyFontSelect.addEventListener("change", onFontChange);

    ponyMenu.addEventListener("click", e => e.stopPropagation());
    ponyHiddenText.addEventListener("focus", () => ponyHiddenText.classList.add("hidden"));
    ponyMain.addEventListener("click", () => ponyHiddenText.focus());

    if (typeof window.FileReader !== "function") ponyFileRow.style.display = "none";
  }

  // --- kick things off ---
  setDefaults();
  bindEvents();
});
