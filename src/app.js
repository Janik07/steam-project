require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");
const aiRoutes = require("./routes/aiRoutes");
const app = express();


// DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// frontend (client folder)
app.use(express.static(path.join(__dirname, "../client")));

// root route → login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/ai", aiRoutes);

module.exports = app;
