const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyparser = require("body-parser");
const socket = require("socket.io");
const server = require("http").Server(app);

require("dotenv").config();
app.use(cors());
app.use(bodyparser.json());

const port = process.env.DEV_PORT;
const host = process.env.DEV_HOST;

app.use("/public", express.static(path.join(__dirname, "public")));

let io = socket(server);

io.on("connection", function(socket) {
  console.log("New Socket Connected at " + socket.id);
  socket.on("message", function(message) {
    io.emit("message", message);
    console.log(message);
  });
});

server.listen(port, host, function() {
  console.log(`App listening on ${host}:${port}`);
});
