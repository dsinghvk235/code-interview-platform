// File: server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.id} joined room ${roomID}`);
  });

  socket.on("code_change", ({ roomID, code }) => {
    socket.to(roomID).emit("receive_code", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.post("/run", async (req, res) => {
  const { language_id, source_code } = req.body;
  try {
    const submission = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        language_id,
        source_code
      },
      {
        headers: {
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": "643c79278amshba7d25e8a3e4166p100b67jsne8eb112250d1"
        }
      }
    );
    res.json(submission.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(4000, () => {
  console.log("Server running on port 4000");
});