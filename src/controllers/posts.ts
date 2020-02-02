import { IPost, IPostModel } from '../models/post.model';
import {
  newPost,
  fetchPosts,
  findPostAndUpdate,
  fetchPostById,
  findPostAndDelete,
} from '../services/posts.service';
import { Router } from 'express';
import { Socket } from 'socket.io';
import { store, io } from '../server';
import logger from '../utils/logger';
import { findUserById, addUserEvent } from '../services/users.service';
import { IEvent } from '../models/event.model';
const router = Router();

const sortByDateCreated = { createdAt: -1 };

// Now reference all users in their posts using
// their userID

const listener = function(socket: Socket) {
  socket.on('post', async function(post: IPost) {
    // post.user._id = socket.handshake.session!.userID;
    // const sessionID = socket.handshake.sessionID as string;

    // The userID *should* be part of the session object like for reals...
    const userID = socket.handshake.session!.userID;

    console.log('Post created by User => ', socket.handshake.sessionID);

    const POST = await newPost(post);

    POST.participants.push(userID);

    POST.save((err: any, p: IPost) => {
      if (err) {
        logger.log('error', 'Error saving post =>' + err);
        socket.emit('error', { error: true, message: 'Error Saving Post' });
      } else {
        // socket.broadcast.emit('new_post', p);

        // Send to all connected clients...
        io.emit('new_post', p);
      }
    });
  });

  // TODO: send a notification to the owner of the post when this happens
  socket.on('start_sharing', function(id: any) {
    const query = {
      status: 'ongoing',
      $push: { participants: socket.handshake.session!.userID },
    };

    const options = { new: true };

    findPostAndUpdate(id, query, options)
      .then(doc => {
        try {
          doc!.participants.forEach((u: any) => {
            findUserById(u)
              .then(u => {
                if (u) {
                  store.get(u.Session, (err: any, sess: any) => {
                    if (sess) {
                      // socket.broadcast
                      //   .to(sess.socketID)
                      //   .emit('post_updated', doc);
                      io.to(sess.socketID).emit('post_updated', doc);
                    }
                  });
                }
                // socket.broadcast.to(socketID).emit('post_updated', doc);
              })
              .catch(err => {
                throw err;
              });
          });
        } catch (error) {
          logger.error('Error! ' + error);
        }

        // socket.broadcast.emit('post_updated', doc);

        const event: IEvent = {
          error: false,
          type: 'active_post',
          post: doc!._id,
          user: doc!.user,
          time: new Date(),
          seen: false,
          message: 'One of your posts in now active!',
        };

        // I think we should just be sending errors to the user if any occur :)

        addUserEvent(doc!.user, event)
          .then(() => {
            logger.info('Event added successfully!');
          })
          .catch((err: any) => {
            logger.error('Error in adding event ' + err);
            throw err;
          });
        // Send a notification to the user that someone has looked at his post
      })
      .catch((err: any) => {
        logger.info("Couldn't update post :(");
        console.log("Couldn't update post :(");
        throw err;
      });
  });
};

router.get('/', async (req, res) => {
  let query = {};

  if (req.query.pending) {
    query = { status: 'pending' };
  }

  await fetchPosts(query)
    .sort(sortByDateCreated)
    // tslint:disable-next-line: no-shadowed-variable
    .then((posts: IPost[]) => {
      res
        .status(200)
        .send(
          JSON.stringify({ error: false, message: 'Posts', results: posts })
        );
    })
    .catch((err: any) => {
      res
        .status(400)
        .send(
          JSON.stringify({ error: true, message: 'Error getting posts', err })
        );
    });
  res.end();
});

/**
 * Fetch single post
 */
router.get('/:id', async (req, res) => {
  await fetchPostById(req.params.id)
    .populate('Chats')
    .then(post => {
      res
        .status(200)
        .send(
          JSON.stringify({ error: false, message: 'Single Post', result: post })
        );
    })
    .catch((err: any) => {
      res.status(400).send(
        JSON.stringify({
          error: true,
          message: 'Error fetching single Post',
          err,
        })
      );
    });
});

/**
 * Find the posts this user is involved in :)
 */
router.get('/user/:id', async (req, res) => {
  const query = { participants: req.params.id };

  await fetchPosts(query)
    .sort(sortByDateCreated)
    .then((posts: IPost[]) => {
      res
        .status(200)
        .send(
          JSON.stringify({ error: false, message: 'Posts', results: posts })
        );
    })
    .catch((err: any) => {
      res
        .status(400)
        .send(
          JSON.stringify({ error: true, message: 'Error getting posts', err })
        );
    });

  res.end();
});
// TODO: Add proper documentation bruh...
router.post('/finish/:id', async (req, res) => {
  const update = { status: 'completed' };

  await findPostAndUpdate(req.params.id, update, { new: true })
    .then(post => {
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: 'Post completed!',
          result: post,
        })
      );

      post!.participants.forEach((u: any) => {
        findUserById(u)
          .then(u => {
            if (u) {
              store.get(u.Session, (err: any, sess: any) => {
                if (sess) {
                  // socket.broadcast
                  //   .to(sess.socketID)
                  //   .emit('post_updated', doc);
                  io.to(sess.socketID).emit('post_completed', post);
                }
              });
            }
            // socket.broadcast.to(socketID).emit('post_updated', doc);
          })
          .catch(err => {
            throw err;
          });
      });
    })
    .catch(err => {
      res.status(400).send(
        JSON.stringify({
          error: false,
          message: 'Error completing post :(',
          err,
        })
      );
    });
});

router.post('/delete/:id', async (req, res) => {
  await findPostAndDelete(req.params.id)
    .then(post => {
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: 'Post deleted!',
          result: post,
        })
      );
    })
    .catch(err => {
      res.status(400).send(
        JSON.stringify({
          error: false,
          message: 'Error deleting post :(',
          err,
        })
      );
    });
});

export { listener, router };
