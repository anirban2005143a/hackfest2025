const ChatHistory = require("../model/Chathistory");
const User = require("../model/userModel");

const savingresponse = async (req, res) => {
  try {
    console.log("aaaya");
    const { question, answer, uniqueId, user_id, title } = req.body;
    console.log(req.body);
    if (!question || !answer || !uniqueId || !user_id) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const chat = await ChatHistory.findOne({ chatId: uniqueId });
    console.log(chat);

    if (!chat) {
      const newchat = await ChatHistory.create({
        chatId: uniqueId,
        title: title,
        userId: user_id,
        chatList: [
          {
            question: question,
            answer: [answer],
          },
        ],
      });
      await newchat.save();
      return res
        .status(200)
        .json({ message: "Chat history saved successfully" });
    } else {
      chat.chatList.push({
        question: question,
        answer: [answer],
      });
      await chat.save();
      return res
        .status(200)
        .json({ message: "Chat history updated successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

const getchathistory = async (req, res) => {
  try {
    const { user_id } = req.body;
    const chat = await ChatHistory.find({ userId: user_id });
    if (!chat) {
      return res.status(404).json({ message: "No chat history found" });
    }
    return res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

const updatechathistory = async (req, res) => {
  try {
    const { newchat, chatId } = req.body;
    if (!newchat || !chatId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const chat = await ChatHistory.findOne({ chatId: chatId });
    if (!chat) {
      return res.status(404).json({ message: "No chat history found" });
    }
    // here newchat is a array
    chat.chatList = newchat;
    await chat.save();
    return res
      .status(200)
      .json({ message: "Chat history updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

const deletechathistory = async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const chat = await ChatHistory.findOneAndDelete({ chatId: chatId });
    if (!chat) {
      return res.status(404).json({ message: "No chat history found" });
    }

    return res
      .status(200)
      .json({ message: "Chat history deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};

const setarchievechat = async (req, res) => {
  const { chatId } = req.body;
  if (!chatId) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const chat = await ChatHistory.findOne({ chatId: chatId });
    if (!chat) {
      return res.status(404).json({ message: "No chat history found" });
    }

    chat.isarchieve = true;
    await chat.save();

    return res
      .status(200)
      .json({ message: "Chat history archived successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Internal server error ${error}` });
  }
};
module.exports = {
  savingresponse,
  getchathistory,
  updatechathistory,
  deletechathistory,
  setarchievechat
};
