const posts = require('./controllers/posts.js');
const chats = require('./controllers/chats.js');

import express from 'express';
import http from 'http';
import i from 'socket.io';
import bodyparser from 'body-parser';
import path from 'path';
import assert from 'assert';
import session from 'express-session';
import sharedSession from 'express-socket.io-session';
import mStore from 'connect-mongodb-session';
import cookie from 'cookie';
import mongoose from 'mongoose';
// import posts from './controllers/posts.js';
const app = express();
const server = new http.Server(app);
const io = i(server);
const MongoDBStore = mStore(session);

require('dotenv').config();
app.use(
  require('cors')({
    origin: ['http://localhost:8080'], // Allow CORS from this domain (the frontend)
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const port = parseInt(process.env.DEV_PORT as string, 2);
const host = process.env.DEV_HOST;
const stage = process.env.NODE_ENV;
const keys = require('./config/environment.js');
// User Sockets

// MongoDB set up
mongoose
  .connect(keys[stage].MONGO_URL, {
    useNewUrlParser: true,
  })
  .then(client => {
    app.locals.db = client.connection.db;
    console.log(
      `Connection to ${client.connection.db.databaseName} database successful!`
    );
  })
  .catch(err => {
    console.error(`Error in connecting to database: `, err);
  });

mongoose.connection.on('error', () => {
  console.log('Error in connection to database');
});

mongoose.connection.on('error', () => {
  console.log('Error occured in database connection');
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// TODO: Convert to Typescript!

// mongoose.connection.once('open', () => {
//   console.log(`Connection to database ${keys[stage].MONGO_URL} successful!`);
// });

// MongoDB Store initiliazation
const store = new MongoDBStore({
  uri: keys[stage].MONGO_URL,
  collection: 'Sessions',
});

const Session = session({
  secret: 'thisisasecret:)',
  cookie: { maxAge: 60000 * 20 },
  store,
  saveUninitialized: false,
  resave: true,
});

// Catch errors
store.on('error', function(error) {
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
io.use(function(socket, next) {
  const cookies = cookie.parse(socket.handshake.headers.cookie);
  if (cookies['connect.sid']) {
    console.log(`Client connected`);
    next();
  } else {
    console.log('No cookie sent, reload the frontend');
    next(new Error('Not authorized man!'));
  }
});

module.exports = {
  io,
  store,
};

const connections = require('./controllers/connections.js');

// Anytime there is a (re)connection save the socketID to the session
io.on('connection', function(socket: i.Socket) {
  // let sessionID = socket.handshake.session.id;

  socket.handshake.session!.socketID = socket.id;
  socket.handshake.session!.save((err: Error) => {
    if (err) {
      console.log('Error is saving session! => ', err);
    }
  });
  // Now each session has it's socketID
});

// TODO: pass a central kini to carry all
//  of these guys

// For Posts stuff
io.on('connection', posts.listener);

// For Chat stuff
io.on('connection', chats.listener);

// For Connections stuff

io.on('connection', connections.listener);

// Last last
server.listen(port, host, function() {
  console.log(`App listening on ${host}:${port}`);
});

/* ==============ROUTES=============== */

app.use('/public', express.static(path.join(__dirname, 'public')));

// app.get('/api/connect', (req, res) => {
//   if (req.session.views) {
//     req.session.views++;
//     res.setHeader('Content-Type', 'text/html');
//     res.write('<p>views: ' + req.session.views + '</p>');
//     res.write('<p>expires in: ' + req.session.cookie.maxAge / 1000 + 's</p>');
//     res.end();
//     console.log('From /api/connect: ', req.session.cookie);
//   } else {
//     req.session.views = 1;
//     res.end('welcome to the session demo. refresh!');
//     console.log('From /api/connect: ', req.session.cookie);
//   }
// });

// Endpoints :b
app.use('/api/posts', posts.router);
app.use('/api/chats', chats.router);
