const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// izinkan semua origin
app.use(cors());

// atau hanya localhost saat development
// app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

// middleware
const { register } = require("../middleware/register.js");

app.post("/register", register);

module.exports = app;
