import express from 'express';
import Chat from '../models/chat.model';
import { Socket } from 'socket.io';
const router = express.Router();

const listener = function(socket: Socket) {
  // console.log("Connection from chat?"+socket.id);
  socket.on('chat', function(chat) {
    console.log('Chat!', chat);
    const CHAT = new Chat(chat);

    CHAT.save((err, c) => {
      if (err) {
        console.log('Error saving chat => ', err);
      } else {
        console.log('New Chat => ', c);
        socket.emit('chat', c);
        socket.broadcast.emit('new_chat', c);
      }
    });
  });
};

router.route('/').get((req, res) => {
  res.send('Inside /chats');
});

router.route('/:id').get((req, res) => {
  const id = req.params.id;
  res.send(`Inside /chats/${id}`);
});

export { listener, router };
