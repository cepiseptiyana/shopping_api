const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

// middleware
const { register } = require("./middleware/register.js");

app.post("/api/register", register);

module.exports = app;
