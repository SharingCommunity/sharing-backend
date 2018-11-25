const mongoose = require("mongoose");
const Connection = require("./connection.js");
const events = require("../utils/events");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  postmessage: {
    type: String,
    required: true
  },
  request: {
    type: Boolean,
    default: null
  },
  offer: {
    type: Boolean,
    default: null
  },
  post_subject: {
    type: String
  },
  connections: {
    type: Array
  },
  created: {
    type: Date
  }
});

PostSchema.pre("save", function(next) {
  if (this.request == true) {
    let self = this;
    Post.findOne(
      {
        offer: true,
        post_subject: this.post_subject,
        connections: { $size: 0 }
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        } else if (doc) {
          let connection = new Connection({
            requested: self._id,
            offered: doc._id,
            created: new Date()
          });
          connection.save(function(err, con) {
            Post.updateMany(
              { _id: { $in: [con.requested, con.offered] } },
              { $set: { "connections.0": con } },
              (err, out) => {
                if (err) console.log(err);
                console.log(out);
              }
            );
            events.connectionEvents.emit("new_connection", con);
          });
          console.log("From Backend", doc);
        }
      }
    );
    return next();
  } else if (this.offer == true) {
    let self = this;
    Post.findOne(
      {
        request: true,
        post_subject: this.post_subject,
        connections: { $size: 0 }
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        } else if (doc) {
          let connection = new Connection({
            requested: doc._id,
            offered: self._id,
            created: new Date()
          });
          console.log("From Backend", doc);
          connection.save((err, con) => {
            Post.updateMany(
              { _id: { $in: [con.requested, con.offered] } },
              { $set: { "connections.0": con } },
              (err, out) => {
                if (err) console.log(err);
                console.log(out);
              }
            );
            events.connectionEvents.emit("new_connection", con);
          });
        }
      }
    );
    return next();
  }
});

module.exports = Post = mongoose.model("Post", PostSchema, "Posts");
