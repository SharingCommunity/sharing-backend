// controllers
import * as posts from './controllers/posts';
import * as chats from './controllers/chats';
import api from './controllers';
import router from './routers';
// modules
import express from 'express';
import http from 'http';
import i from 'socket.io';
import bodyparser from 'body-parser';
import assert from 'assert';
import session from 'express-session';
import sharedSession from 'express-socket.io-session';
import mStore from 'connect-mongodb-session';
import cookie from 'cookie';
import mongoose from 'mongoose';
import helmet from 'helmet';

// Logger
import logger from './utils/logger';

// Middleware and helper functions

// server config
const app = express();
const server = new http.Server(app);
const io = i(server);
const MongoDBStore = mStore(session);
require('dotenv').config();

app.use(
  require('cors')({
    origin: [/\.wegive\.me$/, 'http://localhost:8080'],
    // origin: 'http://localhost:8080',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'UPDATE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(bodyparser.json());

app.use(bodyparser.urlencoded({ extended: true }));

app.use(helmet());

// Disable the 'x-powered-by' in our responses
app.disable('x-powered-by');

// import config from '../configuration/environment';

const port = process.env.PORT || 3000;

const dbstring = process.env.MONGO_URL!.trim();

mongoose
  .connect(dbstring, {
    useNewUrlParser: true,
  })
  .then((client: any) => {
    app.locals.db = client.connection.db;
    logger.log(
      'info',
      `Connection to ${client.connection.db.databaseName} database successful!`
    );
  })
  .catch((err: any) => {
    // console.error(`Error in connecting to database: `, err);
    logger.error('Error connecting to database', [err]);
  });

mongoose.connection.on('error', () => {
  logger.error('Error occured in database connection');
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// mongoose.connection.once('open', () => {
//   console.log(`Connection to database ${keys[stage].MONGO_URL} successful!`);
// });

// MongoDB Store initiliazation
const store = new MongoDBStore(
  {
    uri: dbstring,
    collection: 'Sessions',
  },
  (err: any) => {
    if (err) {
      logger.error('Error connecting Store to MongoDB => ', err);
    }
  }
);

const Session = session({
  name: 'sharing.sid',
  secret: 'thisisasecret:)',
  cookie: {
    maxAge: 60000 * 60 * 24 * 30,
    // domain: '.wegive.me',
    domain: 'localhost',
    secure: 'auto',
    sameSite: 'lax',
    httpOnly: true,
    path: '/',
  },
  store,
  saveUninitialized: false,
  resave: false,
});

// Catch errors
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

// Use Sessions o
app.use(Session);

// io.origins(['*wegive.me:*']);

// Share Express session with SocketIO
io.use(sharedSession(Session));

/* ======= Routes ====== */

app.use('/app', router);
app.use('/api', api);

/* ======= Routes ====== */

app.use('/', (req, res) => {
  res
    .set('content-type', 'text/html')
    .status(200)
    .send('<h4>Hi! Welcome to the Sharing Api</h4>');
});

io.use(function(socket: any, next: any) {
  const sessionID = socket.handshake.sessionID as string;

  if (socket.request.headers.cookie) {
    const cookies = cookie.parse(socket.request.headers.cookie);
    if (cookies['sharing.sid']) {
      store.get(
        sessionID,
        (err: any, sess: Express.SessionData | null | undefined) => {
          if (!err) {
            if (sess) {
              if (process.env.NODE_ENV!.trim() === 'dev') {
                console.log('Client connected!');
                logger.log('info', 'Client Connected!');
              }
              console.log('Cookie found');
              next();
            } else {
              if (process.env.NODE_ENV!.trim() === 'dev') {
                console.log('Invalid Cookie!');
              }
              console.log('Invalid cookie');
              next(new Error('Cookie is expired!'));
            }
          } else {
            next(err);
          }
        }
      );
    } else {
      // delete session :)
      store.destroy(sessionID);
      console.log('No cookie sent man, destroying session :)');
      next(new Error('Not authorized man!'));
    }
  }
});

// Socket.io Instance
// io.use(function(socket, next) {
//   Session(socket.request, socket.request.res || {}, next);
// });

// TODO: look at a better way to pass the io and store objects

export { io, store };

// TODO: I don't like this :p
import * as connections from './controllers/connections';

// Anytime there is a (re)connection save the socketID to the session
// You could actually also save the User id... then map the id to the current socket id.
// TODO: refactor after creating User model

io.on('connection', function(socket: i.Socket) {
  // let sessionID = socket.handshake.session.id;

  if (process.env.NODE_ENV!.trim() === 'dev') {
    logger.log('info', 'Client Connected to socket');
  }

  console.log('Client connected to socket');

  socket.handshake.session!.onlineStart = new Date();
  socket.handshake.session!.online = true;
  socket.handshake.session!.socketID = socket.id;

  socket.handshake.session!.save((err: Error) => {
    if (err) {
      console.log('Errror in saving session! =>', err);
      logger.error('Error in saving session! => ', err);
    }
  });

  socket.on('disconnect', function() {
    socket.handshake.session!.lastOnline = new Date();
    socket.handshake.session!.online = false;

    socket.handshake.session!.save((err: Error) => {
      if (err) {
        console.log('Errror in saving session! =>', err);
        logger.error('Error in saving session! => ', err);
      }
    });
    logger.info(`Disconnected client =>  ${socket.handshake.session!.id}`);
  });
});

/***
 * interface IEnvConfig {
  MONGO_URL: string;
  PORT: number | string;
  HOST: string;
  [keys: string]: any;
}
 */

// TODO: pass a central kini to carry all
//  of these guys

// For Posts stuff
io.on('connection', posts.listener);

// For Chat stuff
io.on('connection', chats.listener);

// For Connections stuff

io.on('connection', connections.listener);

// Last last
server.listen(port, function() {
  logger.info(`App listening on port ${port}`);
});
