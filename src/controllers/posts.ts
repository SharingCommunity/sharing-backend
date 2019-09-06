import Post from '../models/post.model';
import express from 'express';
import { Socket } from 'socket.io';
const router = express.Router();

const sortByDateCreated = { createdAt: -1 };

const listener = function(socket: Socket) {
  socket.on('post', function(post) {
    post.user = socket.handshake.session!.id;

    const POST = new Post(post);

    POST.save((err, p) => {
      socket.emit('post', p);
      socket.broadcast.emit('new_post', p);
    });
    console.log('Client Session :) ', socket.handshake.session!.id);
  });
};

router.get('/', async (req, res) => {
  const posts = await Post.find({})
    .sort(sortByDateCreated)
    // tslint:disable-next-line: no-shadowed-variable
    .then(posts => {
      res
        .status(200)
        .send(
          JSON.stringify({ error: false, message: 'Posts', results: posts })
        );
    })
    .catch(err => {
      res
        .status(400)
        .send(
          JSON.stringify({ error: true, message: 'Error getting posts', err })
        );
    });
  res.end();
});

export { listener, router };
