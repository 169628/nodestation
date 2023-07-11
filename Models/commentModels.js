const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    article_id: {
      type: Number,
      required: [true, "article_id not allowed to be empty"],
    },
    comment: [
      {
        user_id: {
          type: Number,
          required: [true, "user_id not allowed to be empty"],
        },
        username: {
          type: String,
          required: [true, "username not allowed to be empty"],
        },
        content: {
          type: String,
          required: [true, "content not allowed to be empty"],
        },
      },
    ],
  },
  {
    versionKey: false,
  }
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
