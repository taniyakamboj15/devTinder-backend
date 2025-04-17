const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chatSchema");

const getSecretRoomId = ({ userId, targetUserId }) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    transports: ["websocket"],
    cors: {
      origin: [
        "http://localhost:5173",
        "https://devtinder.taniyakamboj.info",
        "https://devtinder.abhinavranjan.me",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId({ userId, targetUserId });
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text, userImage }) => {
        const roomId = getSecretRoomId({ userId, targetUserId });
        try {
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              message: [],
            });
          }

          chat.message.push({ senderId: userId, text });
          await chat.save();

          io.to(roomId).emit("messageReceived", {
            senderId: {
              _id: userId,
              firstName,
              photoURL: userImage,
            },
            text,
            targetUserId,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Error saving message:", err);
        }
      }
    );

    socket.on("typing", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId({ userId, targetUserId });
      socket.to(roomId).emit("typing", { userId });
    });

    socket.on("stopTyping", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId({ userId, targetUserId });
      socket.to(roomId).emit("stopTyping", { userId });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;
