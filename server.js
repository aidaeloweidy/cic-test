

require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const mongoUri =  process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

//let workshopMessages;

async function connectToMongo() {
  try {
    await client.connect();
    const db = client.db("cic-database"); 
    const messages = db.collection("messages");
    const workshopMessages = db.collection("workshop")


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
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
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

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectToMongo();

server.listen(8080, '0.0.0.0', () => {
  console.log("Server running on http://localhost:8080");
});
