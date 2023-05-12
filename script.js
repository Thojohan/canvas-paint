"use strict";

// Selecting html and declaring variables

const canvas = document.querySelector(".canvas");
const selector = document.querySelector(".selector-bar");
const buttons = document.querySelectorAll(".button");
const modal = document.querySelector("#modal-window");
const closeModal = document.querySelector("#close-modal");
const start = document.querySelector(".start");
const end = document.querySelector(".finish");
const ctx = canvas.getContext("2d");

let lineLength;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let contStroke = false;

// HSL and width objects

const hue = {
  name: "hue",
  currentValue: null,
  startValue: null,
  endValue: null,
  increase: null,
};

const light = {
  name: "light",
  currentValue: null,
  startValue: null,
  endValue: null,
  increase: null,
};

const satur = {
  name: "satur",
  currentValue: null,
  startValue: null,
  endValue: null,
  increase: null,
};

const width = {
  name: "width",
  currentValue: null,
  startValue: null,
  endValue: null,
  increase: null,
};

// Check if values should increase/decrease or remain the same

function checkIncrease(object) {
  object.startValue === object.endValue && (object.increase = "same");
  object.startValue < object.endValue && (object.increase = true);
  object.startValue > object.endValue && (object.increase = false);
}

// Update HSL and width objects

function updateValues(object) {
  object.startValue = Number(
    document.querySelector(`#${object.name}Start`).value
  );
  object.endValue = Number(document.querySelector(`#${object.name}End`).value);
  object.currentValue = object.startValue;
  checkIncrease(object);
}

// Caller function for the objects

function callUpdate() {
  updateValues(hue);
  updateValues(satur);
  updateValues(light);
  updateValues(width);
}

// Check if we're drawing or not, set start x/y values and add/remove
// eventlistener for mousemove, calling draw function

function isDrawingFunc(e) {
  if (
    e.type === "mouseup" ||
    e.type === "touchend" ||
    e.type === "mouseout" ||
    e.type === "touchcancel"
  )
    isDrawing = false;
  if (e.type === "mousedown" && e.button === 0) {
    lastX = e.offsetX;
    lastY = e.offsetY;
    isDrawing = true;
  }
  if (e.type === "touchstart") {
    isDrawing = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }

  !contStroke && callUpdate();

  ["mousemove", "touchmove"].forEach(
    (e) => isDrawing && canvas.addEventListener(e, drawing)
  );
  ["mousemove", "touchmove"].forEach(
    (e) => !isDrawing && canvas.removeEventListener(e, drawing)
  );
  //!isDrawing && canvas.removeEventListener("mousemove" || "touchmove", drawing);
}

// Update currentValue of objects

function changeStrokes(object, change) {
  if (
    object.currentValue < object.startValue &&
    object.currentValue < object.endValue
  )
    object.increase = true;
  if (
    object.currentValue > object.startValue &&
    object.currentValue > object.endValue
  )
    object.increase = false;
  if (object.increase === "same") return;
  if (object.increase === true) object.currentValue += change;
  if (object.increase === false) object.currentValue -= change;
}

// The drawing function itself

function drawing(e) {
  if (!isDrawing) return;
  ctx.lineWidth = width.currentValue;
  ctx.strokeStyle = `hsl(${hue.currentValue}, ${satur.currentValue}%, ${light.currentValue}%)`;
  changeStrokes(hue, lineLength / 16);
  changeStrokes(light, lineLength / 15.5);
  changeStrokes(satur, lineLength / 17);
  changeStrokes(width, lineLength / 15);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  const newX = e.type === "mousemove" ? e.offsetX : e.changedTouches[0].clientX;
  const newY = e.type === "mousemove" ? e.offsetY : e.changedTouches[0].clientY;
  ctx.lineTo(newX, newY);
  ctx.stroke();
  lastX = newX;
  lastY = newY;
}

// Handle function for the buttons

function handleFunc(clickEvent) {
  if (clickEvent.target.id === "clear") {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (clickEvent.target.id === "stroke") {
    !contStroke ? (contStroke = true) : (contStroke = false);
    contStroke === true
      ? (clickEvent.target.textContent = "Stroke Reset: Off")
      : (clickEvent.target.textContent = "Stroke Reset: On");
  }
  if (clickEvent.target.id === "help") {
    modal.showModal();
  }
}

// Functions to resize canvas, toggle slider bar and update start values,
// including the two color wheels

function resize() {
  canvas.height = visualViewport.height;
  canvas.width = visualViewport.width;
}

function toggleSelect(e) {
  e.preventDefault();
  e.button === 2 && selector.classList.toggle("active");
}

function setColors() {
  callUpdate();
  lineLength = Number(document.querySelector("#strokes").value);
  start.style.color = `hsl(${hue.startValue}, ${satur.startValue}%, ${light.startValue}%)`;
  end.style.color = `hsl(${hue.endValue}, ${satur.endValue}%, ${light.endValue}%)`;
}

// Call set colors and resize on page load

setColors();
resize();

// Event listeners

[
  "mouseup",
  "mouseout",
  "touchend",
  "touchcancel",
  "mousedown",
  "touchstart",
].forEach((e) => canvas.addEventListener(e, isDrawingFunc));
window.addEventListener("resize", resize);
window.addEventListener("mouseup", toggleSelect);
window.addEventListener("contextmenu", (e) => e.preventDefault());
selector.addEventListener("change", setColors);
buttons.forEach((button) => {
  button.addEventListener("click", handleFunc);
});
closeModal.addEventListener("click", () => {
  modal.close();
});
