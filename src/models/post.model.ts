// tslint:disable: no-shadowed-variable

import Connection from './connection.model';
import events from '../utils/events';
import User from './user.model';
import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  message: string;
  asking: boolean;
  giving: boolean;
  subject: string;
  details: string;
  status: string;
  connections: [];
  participants: string[];
  user: string;
  chats: [];
}

const PostSchema: Schema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    asking: {
      type: Boolean,
      default: false,
    },
    giving: {
      type: Boolean,
      default: false,
    },
    subject: {
      type: String,
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending Sharing',
    },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

PostSchema.pre('save', function(this: IPost, next) {
  if (this.asking === true) {
    const self = this;
    const Post = this.model('Post');
    Post.findOne(
      {
        giving: true,
        subject: this.subject,
        connections: { $size: 0 },
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        } else if (doc) {
          const connection = new Connection({
            givingPost: self._id,
            askingPost: doc._id,
          });
          connection.save(function(err, con) {
            if (err) {
              console.error(err);
            } else {
              Post.updateMany(
                { _id: { $in: [con.askingPost, con.givingPost] } },
                { $set: { 'connections.0': con } },
                (err, out) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(out);
                }
              );
              events.connectionEvents.emit('new_connection', con);
            }
          });
          // console.log("From Backend", doc);
        }
      }
    );
    return next();
  } else if (this.giving === true) {
    const self = this;
    const Post = this.model('Post');
    Post.findOne(
      {
        asking: true,
        subject: this.subject,
        connections: { $size: 0 },
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        } else if (doc) {
          const connection = new Connection({
            askingPost: doc._id,
            givingPost: self._id,
          });
          // console.log("From Backend", doc);
          connection.save((err, con) => {
            if (err) {
              console.error(err);
            } else {
              Post.updateMany(
                { _id: { $in: [con.askingPost, con.givingPost] } },
                { $set: { 'connections.0': con } },
                (err, out) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(out);
                }
              );
              events.connectionEvents.emit('new_connection', con);
            }
          });
        }
      }
    );
    return next();
  }
});

// TODO:
// Test this out
PostSchema.post('save', function(this: IPost, next) {
  User.findOneAndUpdate(
    { _id: this.user },
    { $push: { Posts: this._id } },
    (err, doc) => {
      if (!err) {
        console.log('Update successful!');
      } else {
        throw err;
      }
    }
  );
});

export default mongoose.model<IPost>('Post', PostSchema, 'Posts');
