const express = require("express"),
  app = express(),
  path = require("path"),
  bodyparser = require("body-parser"),
  server = require("http").Server(app),
  io = require("socket.io")(server),
  posts = require("./controllers/posts.js"),
  chats = require("./controllers/chats.js"),
  connections = require("./controllers/connections.js"),
  session = require("express-session"),
  sharedSession = require("express-socket.io-session"),
  MongoDBStore = require("connect-mongodb-session")(session),
  cookieParser = require("cookie-parser"),
  cookie = require("cookie"),
  mongoose = require("mongoose");

require("dotenv").config();
app.use(
  require("cors")({
    origin: ["http://localhost:8080"], // Allow CORS from this domain (the frontend)
    methods: ["GET", "POST"],
    credentials: true
  })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const port = process.env.DEV_PORT;
const host = process.env.DEV_HOST;
const stage = process.env.NODE_ENV;
const keys = require("./config/mode.js");

// User Sockets

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

// MongoDB Store initiliazation
var store = new MongoDBStore({
  uri: keys[stage].MONGO_URL,
  collection: "Sessions"
});

var Session = session({
  secret: "thisisasecret:)",
  cookie: { maxAge: 60000 * 5 },
  store: store,
  saveUninitialized: false,
  resave: true
});

// Catch errors
store.on("error", function(error) {
  assert.ifError(error);
  assert.ok(false);
});

// Use Sessions o
app.use(Session);

// Socket.io Instance
io.use(function(socket, next) {
  Session(socket.request, socket.request.res, next);
});

io.use(sharedSession(Session));

// For prevent clients from connecting if they don't have the cookiess
io.set("authorization", function(handshake, accept) {
  let cookies = cookie.parse(handshake.headers.cookie);
  if (cookies["connect.sid"]) {
    console.log(`Client connected`);
    accept(null, true);
  } else {
    console.log("No cookie sent, reload the frontend");
    accept("Error!", false);
  }
});

// Anytime there is a (re)connection save the socketID to the session
io.on("connection", function(socket) {
  // let sessionID = socket.handshake.session.id;

  socket.handshake.session.socketID = socket.id;

  socket.handshake.session.save();
  // Now each session has it's socketID

  // console.log("Socket Request", socket.handshake.session);
});

// For Posts stuff
io.on("connection", posts.listener);

// For Chat stuff
io.on("connection", chats.listener);

// For Connections stuff
io.on("connection", connections.listener);

// Last last
server.listen(port, host, function() {
  console.log(`App listening on ${host}:${port}`);
});

/* ==============ROUTES=============== */

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/api/connect", (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.setHeader("Content-Type", "text/html");
    res.write("<p>views: " + req.session.views + "</p>");
    res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
    res.end();
    console.log("From /api/connect: ", req.session.cookie);
  } else {
    req.session.views = 1;
    res.end("welcome to the session demo. refresh!");
    console.log("From /api/connect: ", req.session.cookie);
  }
});

app.use("/api/posts", posts.router);
app.use("/api/chats", chats.router);
