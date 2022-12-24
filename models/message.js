const { Schema, model } = require("mongoose");

const MessageSchema = new Schema(
  {
    message: {
      type: String,
      required: [true, "Please provide a message"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address"],
    },
    name: {
      type: String,
      required: [true, "Please provide a full name"],
    },
    subject: {
      type: String,
      required: [true, "Tell us what you want to talk about"],
    },
    read: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Message = model("Message", MessageSchema);

module.exports = Message;
