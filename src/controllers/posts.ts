import Post, { IPost } from '../models/post.model';
import express from 'express';
import { Socket } from 'socket.io';
import { getUserSocketID } from '../utils/helpers';
import User from '../models/user.model';
import { store, io } from '../server';
const router = express.Router();

const sortByDateCreated = { createdAt: -1 };

// Now reference all users in their posts using
// their userID

const listener = function(socket: Socket) {
  socket.on('post', function(post: IPost) {
    // post.user._id = socket.handshake.session!.userID;
    // const sessionID = socket.handshake.sessionID as string;

    // The userID *should* be part of the session object like for reals...
    const userID = socket.handshake.session!.userID;

    console.log('User Session => ', socket.handshake.sessionID);

    const POST = new Post(post);

    POST.participants.push(userID);

    POST.save((err, p) => {
      if (err) {
        console.log('Error saving post => ', err);
        socket.emit('ERROR', { error: true, message: 'Error Saving Post' });
      } else {
        // socket.emit('post', p);
        // socket.broadcast.emit('new_post', p);

        // Send to all connected clients...
        io.emit('new_post', p);

      }
    });
  });

  // TODO: send a notification to the owner of the post when this happens
  socket.on('start-sharing', function(id) {
    Post.findByIdAndUpdate(
      id,
      {
        status: 'Sharing Ongoing',
        $push: { participants: socket.handshake.session!.userID },
      },
      { new: true },
      (err, doc) => {
        if (!err) {
          console.log('Update successful!');
          // Send 'post_updated' to  the users involved!

          //  todo:  Prevent from adding the same participant 2ce.

          doc!.participants.forEach(u => {
            getUserSocketID(u)
              .then(u => {
                if (u) {
                  store.get(u.Session, (err: any, sess: any) => {
                    if (sess) {
                      // socket.broadcast
                      //   .to(sess.socketID)
                      //   .emit('post_updated', doc);
                      io.to(sess.socketID).emit('post_updated', doc);
                      console.log('Socket IDs => ', sess.socketID)
                    }
                  });
                }
                // socket.broadcast.to(socketID).emit('post_updated', doc);
              })
              .catch(err => {
                throw err;
              });
          });

          // socket.broadcast.emit('post_updated', doc);

          const event = {
            error: false,
            type: 2,
            post: doc!._id,
            time: new Date(),
            message: 'One of your posts in now active!',
          };

          // Get the user socketID and then send the post event;

          // doc!.participants.forEach()

          // getUserSocketID(doc!.user)
          //   .then(socketID => {
          //     socket.broadcast.to(socketID).emit('POST_EVENT', event);
          //   })
          //   .catch(err => {
          //     throw err;
          //   });

          User.findByIdAndUpdate(
            doc!.user,
            {
              $push: { Events: event },
            },
            (err, doc) => {
              if (!err) {
                console.log('Event successfully added!');
              } else {
                console.log('Failure in adding event :(');
                throw err;
              }
            }
          );
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
