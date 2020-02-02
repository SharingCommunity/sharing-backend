// fill in later...
import Mongoose, { Schema, Document } from 'mongoose';

export interface IEvent {
  error: boolean;
  type: 'message' | 'connection' | 'active_post';
  message: string;
  post: string;
  user: string;
  time: Date;
  seen: boolean;
}

interface IEventModel extends IEvent, Document {}

const EventSchema: Schema = new Mongoose.Schema(
  {
    error: {
      type: Boolean,
      default: false,
    },
    type: String,
    message: String,
    post: { type: Mongoose.Schema.Types.ObjectId, ref: 'Post' },
    user: { type: Mongoose.Schema.Types.ObjectId, ref: 'User' },
    time: Date,
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

EventSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 4 * 60 * 60 });

export default Mongoose.model<IEventModel>('Event', EventSchema, 'Events');
