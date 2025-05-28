const socket = io();

socket.on("updatePlayerTyping", ({ player, text }) => {
  const box = document.getElementById(player === 1 ? "box1" : "box2");
  const lastChar = text?.slice(-1) || "";
  box.textContent += lastChar;
});
