const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

// middleware
const { register } = require("./api/middleware/register.js");

app.post("/register", register);

module.exports = app;
