import express from 'express';
import { Socket } from 'socket.io';
const chatsRouter = express.Router();

const listener = function(socket: Socket) {
  // console.log("Connection from chat?"+socket.id);
  socket.on('chat', function() {
    console.log('Chat!');
  });
};

chatsRouter.route('/').get((req, res) => {
  res.send('Inside /chats');
});

chatsRouter.route('/:id').get((req, res) => {
  const id = req.params.id;
  res.send(`Inside /chats/${id}`);
});

export { listener, chatsRouter };
