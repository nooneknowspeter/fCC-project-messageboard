const mongoose = require("mongoose");

const { Schema } = mongoose;
const ThreadSchema = require("./thread-model").ThreadSchema;

const BoardSchema = new Schema({
  name: { type: String },
  threads: { type: [ThreadSchema] },
});

exports.BoardSchema = BoardSchema;
module.BoardModel = mongoose.model("Board", BoardSchema);
