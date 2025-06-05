// const socket = io("http://localhost:8080");

// const queues = {
//   box1: [], box2: [],
// };

// const isProcessing = {
//   box1:false,
//   box2: false
// }

// const lastText = {
//   box1: "",
//   box2: ""
// };

// //queue & delay
// function processQueue(boxId) {
//    const box = document.getElementById(boxId);
//   if (queues[boxId].length > 0) {
//     const char = queues[boxId].shift();
//     box.textContent += char;
//     lastText[boxId] += char;

//     setTimeout(() => processQueue(boxId), 1000); //1 sec
//   } else {
//     isProcessing[boxId] = false;
//   }
// }

// socket.on("updatePlayerTyping", ({ player, text }) => {
//   const boxId = player === 1 ? "box1" : "box2";
//   //const box =  document.getElementById(boxId)

//     const prev = lastText[boxId];
//   const diff = text.slice(prev.length);

//   if (diff.length > 0) {
//     queues[boxId].push(...diff.split(""));
//     //lastText[boxId] = text;

//     if (!isProcessing[boxId]) {
//       isProcessing[boxId] = true;
//       processQueue(boxId); 
//     }
//   }
// });

// //needs separate function for this script for timing differences, different socket trigger
// socket.on("updateArchive", (entry) => {
//   const container = document.getElementById("big-text");

//   const newMessageDiv = document.createElement("div");
//   newMessageDiv.className = "message";
//   newMessageDiv.textContent = entry.text;

//   container.appendChild(newMessageDiv);
//   container.scrollTop = container.scrollHeight;
// });

const socket = io("http://localhost:8080");

const queues = {
  box1: [],
  box2: [],
};

const isProcessing = {
  box1: false,
  box2: false,
};

const lastFullText = {
  box1: "",
  box2: ""
};

// Delay function
function processQueue(boxId) {
  const box = document.getElementById(boxId);
  if (queues[boxId].length > 0) {
    const char = queues[boxId].shift();
    box.textContent += char;
    setTimeout(() => processQueue(boxId), 5000); // adjust delay as needed
  } else {
    isProcessing[boxId] = false;
  }
}

socket.on("updatePlayerTyping", ({ player, text }) => {
  const boxId = player === 1 ? "box1" : "box2";
  const fullText = text;

  const prevText = lastFullText[boxId];

  if (fullText.startsWith(prevText)) {
    const newChars = fullText.slice(prevText.length);
    queues[boxId].push(...newChars.split(""));
    lastFullText[boxId] = fullText;

    if (!isProcessing[boxId]) {
      isProcessing[boxId] = true;
      processQueue(boxId);
    }
  } else {
    // If it doesn't start with previous, reset to avoid confusion
    lastFullText[boxId] = fullText;
    document.getElementById(boxId).textContent = fullText;
    queues[boxId] = [];
    isProcessing[boxId] = false;
  }
});
