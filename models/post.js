const mongoose = require("mongoose");
const Connection = require("./connection.js");

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
    Post.findOne({ offer: true, post_subject: this.post_subject }, function(
      err,
      doc
    ) {
      if (err) {
        console.log(err);
      }
      console.log(doc);
      if (doc) {
        let connection = new Connection({
          requested: self._id,
          offered: doc._id,
          created: new Date()
        });
        self.connections.push(connection._id);
        connection.save();
      }
    });
  } else if (this.offer == true) {
    let self = this;
    Post.findOne(
      {
        request: true,
        post_subject: this.post_subject
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        }
        if (doc) {
          let connection = new Connection({
            requested: doc._id,
            offered: self._id,
            created: new Date()
          });
          self.connections.push(connection._id);
          connection.save();
        }
        console.log(doc);
      }
    );
  }
  next();
});

module.exports = Post = mongoose.model("Post", PostSchema, "Posts");
