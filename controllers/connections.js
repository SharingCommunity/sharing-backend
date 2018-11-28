const events = require("../utils/events");

module.exports = {
  listener: function(socket) {
    // let tellClientOfConnection = function(con) {
    //   socket.broadcast.emit("new_connection", con);
    // };
    events.connectionEvents.on("new_connection", function(con) {
      // socket.broadcast.emit("new_connection", con);
      /*  PLAN =>

        - Find the two posts involved,
        - Then find the two sessions involved,
        - Find the two sockets involved from the sessions,
        - Depending on the type of posts: (offer or request)
          alert the sockets.
       
       */
    });
  }
};
