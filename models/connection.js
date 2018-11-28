const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  requested: {
    type: String,
    default: null
  },
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
