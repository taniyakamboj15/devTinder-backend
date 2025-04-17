const express = require("express");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
var validator = require("validator");
const userAuth = require("../middleware/userauth");

profileRouter.use(express.json());

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      throw new Error("Pass word cannot be empty");
    } else if (!validator.isStrongPassword(password)) {
      throw new Error("Not a strong password");
    }
    const hashPass = await bcrypt.hash(password, 10);
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(
      { _id },
      { password: hashPass },
      { new: true }
    );
    res.json(`hey ${user.firstName} ! Your pasword Updated Sucessfully`);
  } catch (err) {
    res.status(401).send(err.message);
  }
});
profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const allowed_Updates = [
      "firstName",
      "lastName",
      "age",
      "photoURL",
      "skills",
      "about",
    ];
    const isUpdateAllowed = Object.keys(req.body).every((k) =>
      allowed_Updates.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not Allowed");
    }
    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.json({ message: `${user.firstName} your profile updated succefully` });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({ message: "Sucessfull", data: user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
module.exports = profileRouter;
