const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());

// middleware
const {
  register,
  login,
  addCart,
  getItems,
  updateQuantity,
} = require("./middleware/register.js");

app.post("/register", register);
app.post("/login", login);
app.post("/addCart", addCart);
app.post("/getItems", getItems);
app.post("/updateQuantity", updateQuantity);

// app.listen(3000, (err) => {
//   console.log("running server");
// });

module.exports = app;
