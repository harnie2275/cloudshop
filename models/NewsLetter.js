const { Schema, model } = require("mongoose");

const NewsLetterShema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email address"],
    },
    suspend: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const NewsLetter = model("NewsLetter", NewsLetterShema);

module.exports = NewsLetter;
