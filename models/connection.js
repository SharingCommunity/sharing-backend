const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  requested: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  offered: {
    type: String,
    default: null
  },
  fulfilled: {
    type: Boolean,
    default: false
  },
  seen: {
    type: Boolean,
    default: false
  },
  created: Date
});

module.exports = Connection = mongoose.model(
  "Connection",
  ConnectionSchema,
  "Connections"
);
