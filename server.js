// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const { MongoClient } = require("mongodb"); 

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static("public"));

// // ======
// const uri = "mongodb+srv://aidaheloweidy:kF8DFrDO4xMQryCF@cluster-input.711fxbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-input"; 
// const client = new MongoClient(uri);
// let collection;

// async function connectToMongo() {
//   try {
//     await client.connect();
//     const db = client.db("text-entries"); //db
//     collection = db.collection("submissions"); // folder
//     console.log("✅ Connected to MongoDB");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error);
//   }
// }

// connectToMongo();
// // ======================

// io.on("connection", (socket) => {
//   console.log("User connected");

//   socket.on("previewChange", (data) => {
//     if (!data.stealth) {
//       socket.broadcast.emit("updatePreview", { text: data.text });
//     }
//   });

//   socket.on("textSubmit", async (data) => {
//     const timestamp = new Date().toISOString().slice(0, 16); // e.g., "2025-04-21T13:45"
//     const entry = { text: data.text, timestamp };

//     if (collection) {
//       try {
//         await collection.insertOne(entry); 
//         console.log("✅ Saved to DB:", entry);
//       } catch (err) {
//         console.error("❌ Error saving to DB:", err);
//       }
//     }

//     io.emit("updateMainText", data);
//     socket.broadcast.emit("updatePreview", { text: "" });
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

// server.listen(8080, '0.0.0.0', () => {
//   console.log("Server running on http://localhost:8080");
// });


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

async function connectToMongo() {
  try {
    await client.connect();
    const db = client.db("cic-database"); // Choose any name for your database
    const messages = db.collection("messages");

    console.log("✅ Connected to MongoDB");

    io.on("connection", (socket) => {
      console.log("User connected");

      // Handle preview – not saved to database
      socket.on("previewChange", (data) => {
        if (!data.stealth) {
          socket.broadcast.emit("updatePreview", { text: data.text });
        }
      });

      // Handle full text submit – this gets saved
      socket.on("textSubmit", async (data) => {
        const entry = {
          text: data.text,
          timestamp: new Date(),
          stealth: data.stealth || false,
        };

        try {
          await messages.insertOne(entry); // Save to MongoDB
          io.emit("updateMainText", entry); // Broadcast to all clients
          socket.broadcast.emit("updatePreview", { text: "" });
        } catch (e) {
          console.error("❌ Error saving to MongoDB:", e);
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectToMongo();

server.listen(8080, '0.0.0.0', () => {
  console.log("Server running on http://localhost:8080");
});
