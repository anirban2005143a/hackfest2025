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

module.exports = {
  savingresponse,
};
