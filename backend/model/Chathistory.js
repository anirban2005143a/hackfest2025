const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chatId: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    chatList: [
      {
        question: { type: String, required: true },
        answer: [{ type: String, required: true }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    isarchieve: {
      type: Boolean,
      default: "false",
    },
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model("ChatHistory", chatSchema);

module.exports = ChatHistory;
