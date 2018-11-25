const events = require("../utils/events");

module.exports = {
  listener: function(socket) {
    // let tellClientOfConnection = function(con) {
    //   socket.broadcast.emit("new_connection", con);
    // };
    events.connectionEvents.on("new_connection", function(con) {
      socket.broadcast.emit("new_connection", con);
    });
  }
};
