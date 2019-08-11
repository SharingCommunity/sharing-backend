import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  requested: string;
  offered: string;
  fulfilled: boolean;
  seen: boolean;
}

const ConnectionSchema: Schema = new Schema(
  {
    fulfilled: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    requested: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    offered: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  },
  { timestamps: true }
);

export default mongoose.model<IConnection>(
  'Connection',
  ConnectionSchema,
  'Connections'
);
