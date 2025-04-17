const express = require("express");
const requestRouter = express.Router();
const userAuth = require("../middleware/userauth");
const Connection = require("../models/connectionSchema");
const User = require("../models/userSchema");

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    const fromUser = req.user._id;

    try {
      const toUser = req.params.userId;
      const status = req.params.status;
      if (!fromUser || !toUser || !status) {
        return res.status(401).json({ error: "Invalid request" });
      }
      // if (toUser === fromUser) {
      //   res.status(401).json({ message: "Invalid" });
      // }
      const allowed_Updates = ["interested", "ignored"];
      if (!allowed_Updates.includes(status)) {
        throw new Error("Invalid Request");
      }
      const isToUserValid = await User.findById({ _id: toUser });
      if (!isToUserValid) {
        return res.status(401).json({ error: "No such User Exists" });
      }
      const existingConnection = await Connection.findOne({
        $or: [
          {
            fromUserid: fromUser,
            toUserid: toUser,
          },
          {
            fromUserid: toUser,
            toUserid: fromUser,
          },
        ],
      });

      if (existingConnection) {
        return res
          .status(409)
          .json({ message: "Connection request already sent" });
      }

      // Create and save new connection
      const connection = new Connection({
        fromUserid: fromUser,
        toUserid: toUser,
        status,
      });
      await connection.save();

      res
        .status(201)
        .json({ message: `Connection request sent to user ${toUser}` });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
requestRouter.put(
  "/request/review/:status/:connectionId",
  userAuth,
  async (req, res) => {
    const loggedUserId = req.user._id;

    try {
      const status = req.params.status;
      const connectionId = req.params.connectionId;
      if (!loggedUserId || !status) {
        return res.status(401).json({ error: "Invalid request" });
      }
      const allowed_Updates = ["rejected", "accepted"];

      // if (toUser === fromUser) {
      //   res.status(401).json({ message: "Invalid" });
      // }
      if (!allowed_Updates.includes(status)) {
        throw new Error("Not allowed");
      }

      const interestedUser = await Connection.findOne({
        _id: connectionId,
        toUserid: loggedUserId,
        status: "interested",
      });
      if (!interestedUser) {
        return res
          .status(401)
          .json({ error: "Cannot accept without sending request " });
      }

      // Create and save new connection
      interestedUser.status = status;
      await interestedUser.save();

      res.status(201).json({ message: `${status}` });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);
module.exports = requestRouter;
