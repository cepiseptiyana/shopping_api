const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// izinkan semua origin
app.use(cors());

// atau hanya localhost saat development
// app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// middleware
const { register } = require("./middleware/register.js");

app.post("/register", register);

// app.listen(3000, (err) => {
//   console.log("running server allright beibeeh");
// });

module.exports = app;
