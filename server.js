const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyparser = require("body-parser");
const socket = require("socket.io");
const server = require("http").Server(app);
const controllers = require("./posts.js");
const mongoose = require("mongoose");

require("dotenv").config();
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const port = process.env.DEV_PORT;
const host = process.env.DEV_HOST;
const stage = process.env.NODE_ENV;
const keys = require("./config/mode.js");

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/posts", controllers.router);

// MongoDB set up
mongoose.connect(
  keys[stage].MONGO_URL,
  { useNewUrlParser: true }
);

mongoose.connection.on("error", () => {
  console.log("Error occured in database connection");
});

mongoose.connection.once("open", () => {
  console.log(`Connection to database ${keys[stage].MONGO_URL} successful!`);
});

// Socket.io Instance

io = socket(server);

io.on("connection", controllers.listener);

server.listen(port, host, function() {
  console.log(`App listening on ${host}:${port}`);
});
