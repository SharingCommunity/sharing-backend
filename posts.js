const Post = require("./models/post");
const post_router = require("express").Router();

module.exports = {
  listener: function(socket) {
    console.log("New Socket Connected at " + socket.id);
    socket.on("post", function(post) {
      post.created = new Date();

      let _post = new Post(post);

      _post.save((err, p) => {
        socket.emit("post", p);
        socket.broadcast.emit("new_post", p);
        console.log("From Client: ", p);
      });

      //   Post.save((err, $post) => {
      //     if (err) throw err;
      //     socket.emit("post", $post);
      //     console.log($post);
      //   });
    });
  },
  router: post_router.get("/", async (req, res) => {
    let posts = await Post.find({});
    res.send(posts);
  })
};
