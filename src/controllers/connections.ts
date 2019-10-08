import Post from '../models/post.model';
import events from '../utils/events';
import { Socket } from 'socket.io';
import { IConnection } from '../models/connection.model';
// import { store as Store } from '../server';
// import {io} from '../server';

// TODO: Really look at this program tbh

const listener = function(socket: Socket) {
  events.connectionEvents.on('new_connection', function(con: IConnection) {
    // socket.broadcast.emit("new_connection", con);
    /*  PLAN =>

        - Find the two posts involved,
        - Then find the two sessions involved,
        - Find the two sockets involved from the sessions,
        - Depending on the type of posts: (givingPost or askingPost)
          alert the sockets.

       */

    const askingPost = con.askingPost;
    const givingPost = con.givingPost;

    let askingUser;
    let givingUser;

    Post.findById(askingPost, (err, doc) => {
      if (err) {
        throw err;
      } else if (doc) {
        console.log(doc.user);
        askingUser = doc.user;
        console.log('Requst User', askingUser);
      } else {
        console.log('Post does not exist');
      }
    });

    Post.findById(givingPost, (err, doc) => {
      if (err) {
        throw err;
      } else if (doc) {
        console.log(doc.user);
        givingUser = doc.user;
        console.log('Offer User', givingUser);
      } else {
        console.log('Post does not exist');
      }
    });

    // const request_socket = Store.get(askingUser, (err, sess) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     return sess.socketID;
    //   }
    // });

    // const offer_socket = Store.get(offerUser, (err, sess) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     return sess.socketID;
    //   }
    // });

    // io.to(request_socket).emit("new_request", con);
    // io.to(offer_socket).emit("new_offer", con);
  });
};

// function initialize(askingPost, givingPost) {
//   const post_users = {};

//   const askingPost = askingPost;
//   const givingPost = givingPost;

//   return new Promise(function(resolve, reject) {
//     // Find request post

//     Post.findById(askingPost, (err, doc) => {
//       if (err) {
//         throw err;
//       } else {
//         console.log(doc.user);
//         askingUser = doc.user;
//       }
//     });

//     // Find offer post

//     Post.findById(givingPost, (err, doc) => {
//       if (err) {
//         throw err;
//       } else {
//         console.log(doc.user);
//         askingUser = doc.user;
//       }
//     });
//   });
// }

export { listener };
