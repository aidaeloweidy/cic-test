let socket;
let inputBox, previewBox, mainText, timerDisplay;
let previewVisible = true;
let inactivityTimer;

let stealthMode = false;
let stealthButton;
let sharedTimer = 0;
let gameOver = false;

let playerNumber;

const imageCollection = [
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746033452/skelly_jirvnq.jpg", 
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746033452/shadows_fi3210.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746033452/signs_dgzdkg.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746033452/skies_axv8qj.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746036076/watches_wxfxba.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1748367689/WhatsApp_Image_2025-05-20_at_10.46.14_fdecccc6_e09edq.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746036075/dolls_vibg8o.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746036076/flowercar_hhgjgq.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1748367689/WhatsApp_Image_2025-05-15_at_09.39.17_7dd9bbba_dg0rl7.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1746036075/catsmassoud_fouixk.jpg",
];


function setup() {
  noCanvas();

  timerDisplay = select("#timer-display");
  inputBox = select("#input-box");
  previewBox = select("#preview-box");
  mainText = select("#main-text");

  inputBox.input(() => {
    sendPreview();
    //resetInactivityTimer();
  });

  

  // select("#send-button").mousePressed(sendText);
  // select('#generate-button').mousePressed(generateText)

  //startInactivityTimer();

  // stealthButton = select("#stealth-button");
  // stealthButton.mousePressed(toggleStealth);

  socket = io.connect(window.location.origin);
  console.log("Client connected to server");

  socket.emit('registerPlayer');

  socket.on('playerNumber', (num) => {
    playerNumber = num;

  })


  //generateText();

  socket.on("updatePreview", updatePreview);
  socket.on("updateMainText", updateMainText);

  document.getElementById("start-button").addEventListener("click", () => {
    socket.emit("tryStart");
    console.log("attempted to start");
  });

  socket.on("gameStart", ({ message, images }) => {
    document.getElementById("start-modal").classList.add("hide");
    document.querySelector(".overlay-svg").classList.add("hide");

    const selectedImages = getRandomImages(imageCollection, 4);
    updateMainText({ text: message });
    showImagePrompt(selectedImages);

    setTimeout(() => {
      hideImagePrompt();
      socket.emit("startTimer");
    }, 20000); //30000 30 seconds
    console.log("started");
  });

  socket.on("notEnoughPlayers", () => {
    alert("Waiting for another player to join...");
  });

  socket.on("timerUpdate", (elapsedSeconds) => {
    //this isnt working actually?
    if (timerDisplay) {
      timerDisplay.textContent = elapsedSeconds;
    }
  });

  socket.on("gameEnd", () => {
    console.log("end");
    sendText();
    inputBox.attribute("disabled", true);
    // select("#send-button").attribute("disabled", true);
    showGameOverScreen();
  });

  socket.on("gameReset", () => {
    console.log("Game was reset. Refreshing...");
    window.location.reload();
  });

  socket.on("timerAlert", () => {
    let timeAlert = document.getElementById("timer-alert-display");
    timeAlert.classList.remove("hide");
    timeAlert.textContent = "متبقي من الوقت 3 دقائق";
  });
}

function showImagePrompt(images) {
  const overlay = document.createElement("div");
  overlay.id = "image-prompt";

  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    overlay.appendChild(img);
  });

  document.body.appendChild(overlay);
}

function hideImagePrompt() {
  const overlay = document.getElementById("image-prompt");
  if (overlay) {
    overlay.remove();
  }
}

function showGameOverScreen() {
  let overlay = document.getElementById("game-end-overlay");
  if (overlay) {
    overlay.classList.remove("hide");
  }

  document.getElementById("refresh").addEventListener("click", () => {
    socket.emit("restartGame");
  });
}

function toggleStealth() {
  stealthMode = !stealthMode;
  stealthButton.html(stealthMode ? "hide: ON" : "hide: OFF");
  stealthButton.style("background", stealthMode ? "grey" : "pink");
}

// function sendPreview() {
//   if (!stealthMode) {
//     let data = { text: inputBox.value() };
//     socket.emit("previewChange", data);
//     console.log("preview sent");

//     socket.emit('playerTyping', { text: data})
//   }
//   console.log("stealth");
// }

function sendPreview() {
  let currentTypedText = inputBox.value();
  let data = { text: currentTypedText, stealth: stealthMode };
  socket.emit("previewChange", data);

  socket.emit('playerTyping', {text: currentTypedText})
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
  event.preventDefault();
  event.target.scrollTop = event.target.scrollHeight;
});

function sendText() {
  let data = { text: inputBox.value() };
  socket.emit("textSubmit", data);
  inputBox.value(""); // empty
  previewBox.html(""); // empty prevview
}

// function generateText(){
//   let randomIndex = Math.floor(Math.random()*newText.length)
//   let randomString = newText[randomIndex];
// inputBox.value(inputBox.value()+randomString)
// }


function updateMainText(data) {
  if (data && data.text) {
    let newText = createDiv(data.text);
    newText.class("submitted-text");

    let mainTextDiv = select("#main-text");
    if (mainTextDiv) {
      mainTextDiv.child(newText);
    }

    // Autoscroll
    setTimeout(() => {
      let submittedTextBox = select("#main-text");
      if (submittedTextBox.elt) {
        submittedTextBox.elt.scrollTop = submittedTextBox.elt.scrollHeight;
      }
    }, 10);
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    sendText();
    return false;
  }
}

function getRandomImages(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// auto send inactivity ~ tracking silence

// function startInactivityTimer() {
//   clearTimeout(inactivityTimer); // Reset timer

//   // inactivityTimer = setTimeout(() => {
//   //   //let randomLetter = String.fromCharCode(97 + floor(random(26))); // a-z
//   //   let space = "_____________";
//   //   inputBox.value(inputBox.value() + space);
//   //   sendText();
//   // }, 40000); // 40 seconds
// }

// function resetInactivityTimer() {
//   startInactivityTimer();
// }
