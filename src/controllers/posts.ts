import Post, { IPost } from '../models/post.model';
import express from 'express';
import { Socket } from 'socket.io';
const router = express.Router();

const sortByDateCreated = { createdAt: -1 };

const listener = function(socket: Socket) {
  socket.on('post', function(post: IPost) {
    // post.user._id = socket.handshake.session!.userID;
    const sessionID = socket.handshake.sessionID as string;

    console.log('User Session => ', socket.handshake.sessionID);

    const POST = new Post(post);

    POST.participants.push(sessionID);

    POST.save((err, p) => {
      if (err) {
        console.log('Error saving post => ', err);
      } else {
        socket.emit('post', p);
        socket.broadcast.emit('new_post', p);
      }
    });
  });

  socket.on('start-sharing', function(id) {
    Post.findByIdAndUpdate(
      id,
      {
        status: 'Sharing Ongoing',
        $push: { participants: socket.handshake.sessionID },
      },{new: true},
      (err, doc) => {
        if (!err) {
          console.log('Update successful!');
          socket.broadcast.emit('post_updated', doc);
        } else {
          throw err;
        }
      }
    );
  });
};

router.get('/', async (req, res) => {
  await Post.find({})
    .populate('connections')
    .populate('chats')
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
