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
        socket.emit('ERROR', {error: true, message: 'Error Saving Post'});
      } else {
        socket.emit('post', p);
        socket.broadcast.emit('new_post', p);

        // Send to all clients including poster...
        // socket.emit('new_post', p);
      }
    });
  });

  // TODO: send a notification to the owner of the post when this happens
  socket.on('start-sharing', function(id) {
    Post.findByIdAndUpdate(
      id,
      {
        status: 'Sharing Ongoing',
        $push: { participants: socket.handshake.sessionID },
      },
      { new: true },
      (err, doc) => {
        if (!err) {
          console.log('Update successful!');
          socket.broadcast.emit('post_updated', doc);

          const event = {
            error: false,
            type: 2,
            post: doc!._id,
            time: new Date(),
            message: 'One of your posts in now active!'
          };
          socket.broadcast.to(doc!.user).emit('POST_EVENT', event);

          // Send a notification to the user that someone has looked at his post
          
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
