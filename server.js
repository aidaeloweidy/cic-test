require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { MongoClient } = require("mongodb");
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

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const connectedUsers = new Set();
const readyPlayers = new Set();
const players = { player1: null, player2: null };

let startTime = Date.now();
let timerStarted = false;
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
      console.log('timer done')
    } else if (elapsedSeconds >= 720) {
      timerAlert();
    }
  }, 1000);
}

function timerAlert() {
  io.emit("timerAlert");
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

      socket.on('registerPlayer', ()=> {
        if (!players.player1) {
          players.player1 = socket.id;
          socket.emit('playerNumber', 1)
        } else if (!players.player2) {
          players.player2 = socket.id;
          socket.emit('playerNumber', 2) 
        } else {
          socket.emit('playerNumber', 0) 
        }
        }
      )

      socket.on('playerTyping', (data) => {
        let playerNum = null;
        if (socket.id === players.player1) playerNum = 1; 
        else if (socket.id === players.player2) playerNum = 2;

        if (playerNum) {
          io.emit('updatePlayerTyping', {player : playerNum, text:data.text})
          //console.log(data.text)
        }
      })
    
      socket.on("disconnect", () => {
        connectedUsers.delete(socket.id);
        readyPlayers.delete(socket.id);
        if (players.player1 === socket.id) players.player1 = null;
        if (players.player2 === socket.id) players.player2 = null;      
        
        if (connectedUsers.size < 2) {
          gameStarted = false;
          playerReadyCount = 0;
          readyPlayers.clear()
        }
        console.log(
          `User disconnected: ${socket.id} | Total: ${connectedUsers.size}`
        );
        console.log('Players:', players)
      });

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

            //const selectedImages = getRandomImages(imageCollection, 4);

            io.emit("gameStart", {
              message: randomMessage.text,
              //images: selectedImages,
            });
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
        gameStarted = false;
        gameOver = false;
        timerStarted = false;
        io.emit("gameReset");
      });

      socket.on("startTimer", () => {
        if (!timerStarted) {
          timerStarted = true;
          startTimer();
        }
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
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongo();

function getRandomImages(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

server.listen(8080, "0.0.0.0", () => {
  console.log("Server running on http://localhost:8080");
});
