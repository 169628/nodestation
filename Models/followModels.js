const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    user_id: {
      type: Number,
      required: [true, "user_id is not allowed to be empty"],
    },
    follower_id: {
      type: Number,
      required: [true, "follower_id is not allowed to be empty"],
    },
    follow_name: {
      type: String,
      required: [true, "follow_name is not allowed to be empty"],
    },
  },
  {
    versionKey: false,
  }
);

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;
