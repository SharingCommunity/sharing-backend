const events = require("../utils/events.js"),
  Post = require("../models/post.js"),
  io = require("../server")["io"],
  Store = require("../server")["store"];

var listener = function(socket) {
  events.connectionEvents.on("new_connection", function(con) {
    // socket.broadcast.emit("new_connection", con);
    /*  PLAN =>

        - Find the two posts involved,
        - Then find the two sessions involved,
        - Find the two sockets involved from the sessions,
        - Depending on the type of posts: (offer or request)
          alert the sockets.

       */

    let request_post = con.requested;
    let offer_post = con.offered;

    let request_user;
    let offer_user;

    Post.findById(request_post, (err, doc) => {
      if (err) {
        throw err;
      } else {
        console.log(doc.user);
        request_user = doc.user;
        console.log("Requst User", request_user);
      }
    });

    Post.findById(offer_post, (err, doc) => {
      if (err) {
        throw err;
      } else {
        console.log(doc.user);
        offer_user = doc.user;
        console.log("Offer User", offer_user);
      }
    });

    // let request_socket = Store.get(request_user, (err, sess) => {
    //   if (err) {
    //     console.error(err);
    //   } else {
    //     return sess.socketID;
    //   }
    // });

    // let offer_socket = Store.get(offer_user, (err, sess) => {
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

function initialize(request_post, offer_post) {
  let post_users = {};

  let request_post = request_post;
  let offer_post = offer_post;

  return new Promise(function(resolve, reject) {
    // Find request post

    Post.findById(request_post, (err, doc) => {
      if (err) {
        throw err;
      } else {
        console.log(doc.user);
        request_user = doc.user;
      }
    });

    // Find offer post

    Post.findById(offer_post, (err, doc) => {
      if (err) {
        throw err;
      } else {
        console.log(doc.user);
        request_user = doc.user;
      }
    });
  });
}

module.exports = {
  listener: listener
};
