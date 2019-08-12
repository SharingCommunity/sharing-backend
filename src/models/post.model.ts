// tslint:disable: no-shadowed-variable

import Connection from './connection.model';
import events from '../utils/events';
import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  postmessage: string;
  request: boolean;
  offer: boolean;
  post_subject: string;
  connections: [];
  user: string;
}

const PostSchema: Schema = new mongoose.Schema(
  {
    postmessage: {
      type: String,
      required: true,
    },
    request: {
      type: Boolean,
      default: null,
    },
    offer: {
      type: Boolean,
      default: null,
    },
    post_subject: {
      type: String,
    },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

PostSchema.pre('save', function(this: IPost, next) {
  if (this.request === true) {
    const self = this;
    const Post = this.model('Post');
    Post.findOne(
      {
        offer: true,
        post_subject: this.post_subject,
        connections: { $size: 0 },
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        } else if (doc) {
          const connection = new Connection({
            requested: self._id,
            offered: doc._id,
          });
          connection.save(function(err, con) {
            if (err) {
              console.error(err);
            } else {
              Post.updateMany(
                { _id: { $in: [con.requested, con.offered] } },
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
  } else if (this.offer === true) {
    const self = this;
    const Post = this.model('Post');
    Post.findOne(
      {
        request: true,
        post_subject: this.post_subject,
        connections: { $size: 0 },
      },
      function(err, doc) {
        if (err) {
          console.log(err);
        } else if (doc) {
          const connection = new Connection({
            requested: doc._id,
            offered: self._id,
          });
          // console.log("From Backend", doc);
          connection.save((err, con) => {
            if (err) {
              console.error(err);
            } else {
              Post.updateMany(
                { _id: { $in: [con.requested, con.offered] } },
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

export default mongoose.model<IPost>('Post', PostSchema, 'Posts');
