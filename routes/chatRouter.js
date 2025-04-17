const express = require("express");
const userAuth = require("../middleware/userauth");
const Chat = require("../models/chatSchema");
const chatRouter = express.Router();

chatRouter.get("/chat/:targeUserId", userAuth, async (req, res) => {
  const targetUserId = req.params.targeUserId;
  const userId = req.user._id;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "message.senderId",
      select: "firstName lastName photoURL ",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        message: [],
      });
      await chat.save();
    }
    res.json({ data: chat });
  } catch (err) {}
});
module.exports = chatRouter;
