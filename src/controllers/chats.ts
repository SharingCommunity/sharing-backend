import express from 'express';
import { Socket } from 'socket.io';
const router = express.Router();

const listener = function(socket: Socket) {
  // console.log("Connection from chat?"+socket.id);
  socket.on('chat', function() {
    console.log('Chat!');
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
