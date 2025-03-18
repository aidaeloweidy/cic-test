// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");
  
  socket.on("previewChange", (data) => {
    if (!data.stealth) {
      socket.broadcast.emit("updatePreview", { text: data.text });
    }
  });

  socket.on("textSubmit", (data) => {
    io.emit("updateMainText", data);
    socket.broadcast.emit("updatePreview", { text: "" }); 
  });
  

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});