const mongoose = require("mongoose");

const { Schema } = mongoose;
const date = new Date();
const ReplySchema = require("./reply-model").ReplySchema;

const ThreadSchema = new Schema({
  text: { type: String },
  delete_password: { type: String },
  reported: { type: Boolean, default: false },
  created_on: { type: Date, default: date },
  bumped_on: { type: Date, default: date },
  replies: { type: [ReplySchema] },
});


exports.ThreadSchema = ThreadSchema;
exports.ThreadModel = mongoose.model("Thread", ThreadSchema);
