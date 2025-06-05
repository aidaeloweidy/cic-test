const socket = io("http://localhost:8080");

// Elements
const preview1 = document.getElementById("box1");
const preview2 = document.getElementById("box2");
const combinedTextBox = document.getElementById("big-text");
//const archiveContainer = document.getElementById("archive-container");

// Store the full revealed text
let combinedText = "";

// Store player previews
socket.on("updatePlayerTyping", ({ player, text }) => {
  if (player === 1) preview1.textContent = text;
  if (player === 2) preview2.textContent = text;
});

// Handle full finalized updates with delay
socket.on("updateMainText", ({ player, text }) => {
  setTimeout(() => {
    // Once delayed, add to the shared box
    combinedText += text + "\n";
    combinedTextBox.textContent = combinedText;
    combinedTextBox.scrollTop = combinedTextBox.scrollHeight;
  }, 20000); // 20 seconds
});

// // Receive last 10 archived entries once
// socket.on("initialArchive", (entries) => {
//   entries.forEach(entry => {
//     const div = document.createElement("div");
//     div.className = "archive-entry";
//     div.textContent = entry.text;
//     archiveContainer.appendChild(div);
//   });
// });

// // Ask for last 10 entries when page loads
// socket.emit("getLastArchive", 10);
