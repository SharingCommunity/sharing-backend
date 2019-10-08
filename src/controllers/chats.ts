import express from 'express';
import Chat from '../models/chat.model';
import { Socket } from 'socket.io';
const router = express.Router();

const listener = function(socket: Socket) {
  // console.log("Connection from chat?"+socket.id);
  socket.on('chat', function(chat) {
    // TODO: inform particpants of new chat
    // Send a notification to other participant when there's a new chat
    // message

    // Use io.emit('message' , 'message text') to send to all clients including sender

    console.log('Chat!', chat);
    const CHAT = new Chat(chat);

    CHAT.save((err, c) => {
      if (err) {
        console.log('Error saving chat => ', err);
        socket.emit('ERROR', {error: true, message: 'Error Saving Chat'});
      } else {
        console.log('New Chat => ', c);

        // Send the chat back to the Client after saving in the DB
        socket.emit('chat', c);

        // Only send 'new chat' message to all participants.
        socket.broadcast.to(CHAT.to).emit('new_message', c);

        // socket.broadcast.emit('new_chat', c);
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
