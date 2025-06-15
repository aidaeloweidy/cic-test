const socket = io("http://localhost:8080");
const preview1 = document.getElementById("box1");
const preview2 = document.getElementById("box2");
const combinedTextBox = document.getElementById("big-text");

let combinedText = "";


socket.on("updatePlayerTyping", ({ player, text }) => {
  if (player === 1) preview1.textContent = text;
  if (player === 2) preview2.textContent = text;
});


socket.on("updateMainText", ({ player, text }) => {
  setTimeout(() => {
    
    combinedText += text + "\n";
    combinedTextBox.textContent = combinedText;
    combinedTextBox.scrollTop = combinedTextBox.scrollHeight;
  }, 20000); // 20 seconds
});

