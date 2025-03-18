
let socket;
let inputBox, previewBox, mainText;
let previewVisible = true;

let stealthMode = false;
let stealthButton;


function setup() {
  noCanvas();
  // let toggleButton = select("#toggle-preview");
  // if (toggleButton) {
  //   toggleButton.mousePressed(togglePreview);
  //   //toggleButton.style("background-color", "green"); // Explicitly set the color
  // }
  inputBox = select("#input-box");
  previewBox = select("#preview-box");
  mainText = select("#main-text");
  
  inputBox.input(sendPreview);
  select("#send-button").mousePressed(sendText);

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
  }
}

function sendPreview() {
  let data = { text: inputBox.value(), stealth: stealthMode }; 
  socket.emit("previewChange", data);
}
function updatePreview(data) {
  previewBox.html(data.text);
}



function sendText() {
  let data = { text: inputBox.value() };
  socket.emit("textSubmit", data);
  inputBox.value("");  // empty
  previewBox.html(""); // empty prevview
}

// adding a tester thing here 
function updateMainText(data) {
  let newText = createDiv(data.text);
  newText.class("submitted-text"); 
  mainText.child(newText);
}
