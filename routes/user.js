const express = require("express");
const userRouter = express.Router();
const userAuth = require("../middleware/userauth");
const Connection = require("../models/connectionSchema");
const User = require("../models/userSchema");

userRouter.use(express.json());
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  const userId = req.user._id;

  try {
    if (!userId) {
      throw new Error("Please Login");
    }
    const userRequests = await Connection.find({
      toUserid: userId,
      status: "interested",
    }).populate("fromUserid", [
      "firstName",
      "lastName",
      "photoURL",
      "age",
      "gender",
    ]);
    if (!userRequests) {
      throw new Error("No Requests Available");
    }
    res.json({ data: userRequests });
  } catch (err) {
    res.status(401).send(err.message);
  }
});
userRouter.get("/user/connection", userAuth, async (req, res) => {
  const userId = req.user._id;

  try {
    if (!userId) {
      throw new Error("Please Login");
    }
    const userRequests = await Connection.find({
      $or: [
        {
          toUserid: userId,
          status: "accepted",
        },
        {
          fromUserid: userId,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserid", "firstName lastName photoURL email age gender ")
      .populate("toUserid", "firstName lastName photoURL email age gender");
    if (!userRequests) {
      throw new Error("Not yet sent connection");
    }
    const connectionData = userRequests.map((row) => {
      if (row.fromUserid._id.toString() === userId.toString()) {
        // WE CANNOT COMPARE OBJECT LIKELY ====
        return row.toUserid;
      } else {
        return row.fromUserid;
      }
    });
    res.json({
      data: connectionData,
    });
  } catch (err) {
    res.status(401).send(err.message);
  }
});
userRouter.get("/user/feed", userAuth, async (req, res) => {
  const loggedUser = req.user;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const connectedUser = await Connection.find({
      $or: [
        {
          toUserid: loggedUser._id,
        },
        {
          fromUserid: loggedUser._id,
        },
      ],
    }).select("fromUserid toUserid _id");
    const hiddenUser = new Set();
    connectedUser.forEach((req) => {
      hiddenUser.add(req.fromUserid.toString());
      hiddenUser.add(req.toUserid.toString());
    });
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUser) } }, // [...hiddenUser]
        {
          _id: {
            $ne: loggedUser._id,
          },
        },
      ],
    })
      .select("firstName lastName photoURL email skills about age gender")
      .skip(skip)
      .limit(limit);
    res.json({ message: "sucessfull", data: users });
  } catch (error) {
    res.status(401).send(error.message);
  }
});
userRouter.get(
  "/user/chat/info/:targetUserInfo",
  userAuth,
  async (req, res) => {
    try {
      const userId = req.params.targetUserInfo;
      if (!userId) {
        throw new Error("Error fetching info");
      }
      const userInfo = await User.findById(
        userId,
        "firstName lastName photoURL "
      );
      res.json({ data: userInfo });
    } catch (err) {}
  }
);


module.exports = userRouter;
