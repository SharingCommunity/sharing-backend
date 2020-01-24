import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  askingPost: string;
  givingPost: string;
  fulfilled: boolean;
  seen: boolean;
}

const ConnectionSchema: Schema = new mongoose.Schema(
  {
    fulfilled: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    askingPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    givingPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

export default mongoose.model<IConnection>(
  'Connection',
  ConnectionSchema,
  'Connections'
);
