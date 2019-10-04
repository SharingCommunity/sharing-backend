// tslint:disable: no-shadowed-variable

import Post from './post.model';
import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  message: string;
  post: string;
  from: string;
  to: string;
  time: Date;
}

const ChatSchema: Schema = new mongoose.Schema(
  {
    message: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    from: String,
    to: String,
    time: Date,
  },
  { timestamps: true }
);

// Add Chat to post

ChatSchema.post('save', function(this: IChat, next) {
  Post.findOneAndUpdate(
    { _id: this.post },
    { $push: { chats: this._id } },
    (err, doc) => {
      if (!err) {
        console.log('Update successful!');
      } else {
        throw err;
      }
    }
  );
});

export default mongoose.model<IChat>('Chat', ChatSchema, 'Chats');
