const Post = require("../models/post");
const post_router = require("express").Router();

module.exports = {
  listener: function(socket) {
    socket.on("post", function(post) {
      post.created = new Date();
      post.user = socket.handshake.session.id;

      let _post = new Post(post);

      _post.save((err, p) => {
        socket.emit("post", p);
        socket.broadcast.emit("new_post", p);
        // console.log("From Client: ", p);
      });
      console.log("Client Session :) ", socket.handshake.session.id);
    });
  },
  router: post_router
};

post_router.get("/", async (req, res) => {
  if (req.session.user) {
    req.session.user_times++;
  } else {
    req.session.user_times = 0;
    let user = {
      appName: "VueJS"
    };

    req.session.user = user;
  }

  let posts = await Post.find({});
  res.send(posts);
  res.end();
});
