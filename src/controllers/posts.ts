import Post from '../models/post.model';
import express from 'express';
import { Socket } from 'socket.io';
const router = express.Router();

const sortByDateCreated = { createdAt: -1 };

const listener = function(socket: Socket) {
  socket.on('post', function(post) {
    post.user = socket.handshake.session!.userID;

    const POST = new Post(post);

    POST.save((err, p) => {
      if (err) {
        console.log('Error saving post => ', err);
      } else {
        socket.emit('post', p);
        socket.broadcast.emit('new_post', p);
      }
    });
  });
};

router.get('/', async (req, res) => {
  const posts = await Post.find({})
    .populate('user')
    .populate('connections')
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
