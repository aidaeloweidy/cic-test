require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const connectedUsers = new Set();
const readyPlayers = new Set();

let startTime = Date.now();
let timerInterval;
let gameStarted = false;
let gameOver = false;

function startTimer() {
  startTime = Date.now();

  timerInterval = setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    io.emit("timerUpdate", elapsedSeconds);

    if (elapsedSeconds >= 900) {
      clearInterval(timerInterval);
      endGame();
    } else if (elapsedSeconds >= 720) {
      timerAlert();
    }
  }, 1000);
}

function timerAlert() {
  io.emit('timerAlert');
}

function endGame() {
  io.emit("gameEnd");
  console.log("ended");
  startTime = 0;
  gameStarted = false;
  gameOver = true;
}

async function connectToMongo() {
  try {
    await client.connect();
    const db = client.db("cic-database");
    const messages = db.collection("messages");
    const workshopMessages = db.collection("workshop");

    // fetch for submitted archive
    app.get("/messages", async (req, res) => {
      try {
        const allMessages = await messages
          .find({}, { projection: { text: 1, _id: 0 } }) // only return text
          .toArray();
        res.json(allMessages);
      } catch (err) {
        console.error("＞﹏＜ Failed to fetch messages:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // fetch for starter prompt sentence
    app.get("/random-workshop-message", async (req, res) => {
      try {
        const messages = await workshopMessages.find({}).toArray();
        if (messages.length > 0) {
          const randomMessage =
            messages[Math.floor(Math.random() * messages.length)];
          res.json({ text: randomMessage.text });
        } else {
          res.status(404).json({ error: "No messages found" });
        }
      } catch (err) {
        console.error("Error fetching workshop messages:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    console.log("(❁´◡`❁) Connected to MongoDB");

    io.on("connection", (socket) => {
      console.log("User connected");

      //count users
      connectedUsers.add(socket.id);
      console.log(
        `User connected: ${socket.id} | Total: ${connectedUsers.size}`
      );

      socket.on("disconnect", () => {
        connectedUsers.delete(socket.id);
        readyPlayers.delete(socket.id);
        //playerReadyCount = 0;
        console.log(
          `User disconnected: ${socket.id} | Total: ${connectedUsers.size}`
        );
      });

      // socket.on("tryStart", async () => {
      //   if (connectedUsers.size === 2 && !gameStarted) {
      //     playerReadyCount += 1;

      //     if (playerReadyCount === 2) {
      //       gameStarted = true;
      //       gameOver = false;

      //       try {
      //         const messages = await workshopMessages.find({}).toArray();
      //         if (messages.length > 0) {
      //           const randomMessage =
      //             messages[Math.floor(Math.random() * messages.length)];
      //           io.emit("gameStart", randomMessage.text); // Send message to both
      //         } else {
      //           io.emit("gameStart", "No messages found.");
      //         }
      //       } catch (err) {
      //         console.error("Error fetching message:", err);
      //         io.emit("gameStart", "Error loading message.");
      //       }

      //       startTimer();
      //       console.log("started");
      //     }
      //   } else {
      //     socket.emit("notEnoughPlayers");
      //   }
      // });

      socket.on("tryStart", async () => {
        if (connectedUsers.size < 2) {
          socket.emit("notEnoughPlayers");
          return;
        }
    
        if (gameStarted) {
          socket.emit("gameAlreadyStarted");
          return;
        }
    
        readyPlayers.add(socket.id);
        console.log("Ready players:", readyPlayers.size);
    
        if (readyPlayers.size === 2) {
          gameStarted = true;
          gameOver = false;
    
          try {
            const messages = await workshopMessages.find({}).toArray();
            const randomMessage = messages.length
              ? messages[Math.floor(Math.random() * messages.length)]
              : { text: "No messages found." };
    
            io.emit("gameStart", randomMessage.text);
            startTimer();
          } catch (err) {
            console.error("Error fetching message:", err);
            io.emit("gameStart", "Error loading message.");
          }
        } else {
          socket.emit("waitingForOtherPlayer");
        }
      });

      socket.on("restartGame", () => {
        console.log(" restarting...");
        readyPlayers.clear();
        //playerReadyCount = 0;
        gameStarted = false;
        gameOver = false;

        io.emit("gameReset");
      });

      // preview not saved
      socket.on("previewChange", (data) => {
        if (!data.stealth) {
          socket.broadcast.emit("updatePreview", { text: data.text });
        }
      });

      // saved on submit
      socket.on("textSubmit", async (data) => {
        const entry = {
          text: data.text,
          timestamp: new Date(),
          stealth: data.stealth || false,
        };

        try {
          await messages.insertOne(entry);
          io.emit("updateMainText", entry);
          io.emit("updateArchive", entry);
          socket.broadcast.emit("updatePreview", { text: "" });
        } catch (e) {
          console.error(" Error saving to MongoDB:", e);
        }
      });

      // socket.on("disconnect", () => {
      //   console.log("User disconnected");
      // });
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongo();

server.listen(8080, "0.0.0.0", () => {
  console.log("Server running on http://localhost:8080");
});
