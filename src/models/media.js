const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  mediaType: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Media", mediaSchema);
