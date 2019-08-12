import Post from '../models/post.model';
import express from 'express';
import { Socket } from 'socket.io';
const postRouter = express.Router();

const listener = function(socket: Socket) {
  socket.on('post', function(post) {
    post.user = socket.handshake.session!.id;

    const POST = new Post(post);

    POST.save((err, p) => {
      socket.emit('post', p);
      socket.broadcast.emit('new_post', p);
      // console.log("From Client: ", p);
    });
    console.log('Client Session :) ', socket.handshake.session!.id);
  });
};

postRouter.get('/', async (req, res) => {
  if (req.session!.user) {
    req.session!.user_times++;
  } else {
    req.session!.user_times = 0;
    const user = {
      appName: 'VueJS',
    };

    req.session!.user = user;
  }

  const posts = await Post.find({});
  res.send(posts);
  res.end();
});

export { listener, postRouter };
