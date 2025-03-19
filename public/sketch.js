let socket;
let inputBox, previewBox, mainText;
let previewVisible = true;
let inactivityTimer;

let stealthMode = false;
let stealthButton;

function setup() {
  noCanvas();

  inputBox = select("#input-box");
  previewBox = select("#preview-box");
  mainText = select("#main-text");

  inputBox.input(() => {
    sendPreview();
    resetInactivityTimer();
  });

  select("#send-button").mousePressed(sendText);

  startInactivityTimer();

  stealthButton = select("#stealth-button");
  stealthButton.mousePressed(toggleStealth);

  socket = io.connect(window.location.origin);
  socket.on("updatePreview", updatePreview);
  socket.on("updateMainText", updateMainText);
}

function toggleStealth() {
  stealthMode = !stealthMode;
  stealthButton.html(stealthMode ? "hide: ON" : "hide: OFF");
  stealthButton.style("background", stealthMode ? "grey" : "pink");
}

function sendPreview() {
  if (!stealthMode) {
    let data = { text: inputBox.value() };
    socket.emit("previewChange", data);
    console.log('preview sent')
  }
  console.log('stealth')
}

function sendPreview() {
  let data = { text: inputBox.value(), stealth: stealthMode };
  socket.emit("previewChange", data);
}
// neeed to add here autoscroll preview
// function updatePreview(data) {
//   previewBox.html(data.text);
// }
function updatePreview(data) {
  previewBox.html(data.text);
//autoscroll
  let previewTextBox = document.querySelector("#preview-box");
  if (previewTextBox) {
    setTimeout(() => {
      previewTextBox.scrollTop = previewTextBox.scrollHeight;
    }, 10);
  }
}

document.querySelector("#preview-box").addEventListener("wheel", (event) => {
  event.preventDefault(); // Disable mouse scroll
  event.target.scrollTop = event.target.scrollHeight; // Keep view the bottom
});


function sendText() {
  let data = { text: inputBox.value() };
  socket.emit("textSubmit", data);
  inputBox.value(""); // empty
  previewBox.html(""); // empty prevview
}

// add autoscroll, and enter to send
function updateMainText(data) {
  let newText = createDiv(data.text);
  newText.class("submitted-text");
  mainText.child(newText);

  setTimeout(() => {
    let submittedTextBox = document.querySelector("#main-text");
    submittedTextBox.scrollTop = submittedTextBox.scrollHeight;
  }, 10);
}

function keyPressed() {
  if (keyCode === ENTER) {
    sendText();
    return false;
  }
}

// adding timer function

function startInactivityTimer() {
  clearTimeout(inactivityTimer); // Reset timer if it was running

  inactivityTimer = setTimeout(() => {
    //let randomLetter = String.fromCharCode(97 + floor(random(26))); // a-z
    let space = "____________";
    inputBox.value(inputBox.value() + space);
  }, 20000); // 20 seconds
  //  if (!stealthMode) {
  //    sendPreview();
  //  }
}

function resetInactivityTimer() {
  startInactivityTimer(); // Restart the timer when user types
}
