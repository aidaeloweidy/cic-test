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
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749668054/IMG_7805_ivvsqy.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749667833/18afa5f8-54e9-4570-ae0a-d2bb80b6fbcf_ze0gqq.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749667655/IMG_0405_em7x02.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749667654/IMG_0404_nlitzk.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749667653/IMG_0407_qgq9ze.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749667653/IMG_0406_yub1ty.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749667652/IMG_0408_ftx9ue.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749664433/IMG_0288_ulusht.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749664029/IMG_7497_bknw7l.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749663466/IMG_5180_lcb9vv.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749663028/IMG_1350_neurbx.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661809/IMG_4696_nw7hc7.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661632/IMG_2663_cmvjdg.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661408/FullSizeRender_r16kxg.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661374/IMG_0872_anbudl.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661295/IMG_9656_azvjoe.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661188/IMG_8764_nh8nwg.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661103/FullSizeRender_mtd10s.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749661062/IMG_7883_mfzl5t.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749660568/IMG_6094_quecvp.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749660124/2E7A7451-0887-48E8-9AFB-6C03E4DCBB02_mx8hbk.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749659204/IMG_6812_Original_yn0zup.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749659027/IMG_0954_qhhtox.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749658686/FullSizeRender_lb24g4.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749658517/FullSizeRender_em7kck.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749658380/FullSizeRender_gryhtx.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749657997/IMG_2261_dxd3wj.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749552439/IMG_3462_lkfnaz.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1749552314/IMG_0400_q9ti8n.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1748367689/WhatsApp_Image_2025-05-15_at_09.39.17_7dd9bbba_dg0rl7.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1748367689/WhatsApp_Image_2025-05-20_at_10.46.14_fdecccc6_e09edq.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746036076/watches_wxfxba.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746036076/flowercar_hhgjgq.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746036075/dolls_vibg8o.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746033452/skies_axv8qj.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746033452/shadows_fi3210.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746033452/skelly_jirvnq.jpg",
  "https://res.cloudinary.com/dkctj89zw/image/upload/v1746033452/signs_dgzdkg.jpg",
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

  socket.emit("registerPlayer");

  socket.on("playerNumber", (num) => {
    playerNumber = num;
  });

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
    }, 30000); //30000 30 seconds
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
    timeAlert.textContent =
      "متبقي من الوقت 3 دقائق there are 3 minutes left";
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

  socket.emit("playerTyping", { text: currentTypedText });
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
