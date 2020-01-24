// tslint:disable: no-shadowed-variable

import Post from './post.model';
import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  message: string;
  post: string;
  from: string;
  // to: string;
  participants: string[];
  time: Date;
}

const ChatSchema: Schema = new mongoose.Schema(
  {
    message: String,
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    time: Date,
  },
  { timestamps: true }
);

// Add Chat to post

ChatSchema.post('save', function(this: IChat, next: any) {
  Post.findOneAndUpdate(
    { _id: this.post },
    { $push: { chats: this._id } },
    (err: any, doc: any) => {
      if (!err) {
        console.log('Update successful!');
      } else {
        throw err;
      }
    }
  );
});

export default mongoose.model<IChat>('Chat', ChatSchema, 'Chats');
