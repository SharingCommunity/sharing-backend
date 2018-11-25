const chats_router = require("express").Router();

module.exports = {
  listener: function(socket) {
    // console.log("Connection from chat?"+socket.id);
    socket.on("chat", function() {
      console.log("Chat!");
    });
  },
  router: chats_router
};

chats_router.route("/").get((req, res) => {
  res.send("Inside /chats");
});

chats_router.route("/:id").get((req, res) => {
  let id = req.params.id;
  res.send(`Inside /chats/${id}`);
});
