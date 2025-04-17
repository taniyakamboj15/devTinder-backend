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
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinChat", ({ userId, targetUserId }) => {
      const roomId = getSecretRoomId({ userId, targetUserId });
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
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
          console.log(`Message sent to ${roomId}: ${text}`);
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
