let socket;
let inputBox, previewBox, mainText;
let previewVisible = true;
let inactivityTimer;

let stealthMode = false;
let stealthButton;
let newText = ['somestuff', 'كنت مذهولا لا أصدق ما يحدث لي، لكن الله منحني فرصة جديدة، عفو رئاسي مكنني من العودة لأعمالي والمشاركة في اعمار مصر في "مدينتي" والعاصمة الجديدة والساحل الشمالي، أراد الله أن تستفيد مصر من خبراتي وأعمالي لبناء مجتمعاتب', 'another long piece of text that says whatever in it']

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
  select('#generate-button').mousePressed(generateText)

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

function generateText(){
  let randomIndex = Math.floor(Math.random()*newText.length)
  let randomString = newText[randomIndex];
inputBox.value(inputBox.value()+randomString)
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

// auto send / space silence function 

function startInactivityTimer() {
  clearTimeout(inactivityTimer); // Reset timer 

  // inactivityTimer = setTimeout(() => {
  //   //let randomLetter = String.fromCharCode(97 + floor(random(26))); // a-z
  //   let space = "░░░░░░░░░░░░░░░░░░░░";
  //   inputBox.value(inputBox.value() + space);
  //   sendText(); 
  // }, 10000); // 40 seconds
 
}

function resetInactivityTimer() {
  startInactivityTimer(); 
}
