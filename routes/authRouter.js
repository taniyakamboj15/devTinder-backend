const validateSignUp = require("../utils/validateSignUp");
const express = require("express");
const authRouter = express.Router();
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const userAuth = require("../middleware/userauth");
const emailAuth = require("../middleware/emailauth");
require("dotenv").config();

// for making json body data to obj

authRouter.post("/signup", emailAuth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      photoURL,
      age,
      gender,
      skills,
      about,
    } = req.body;
    validateSignUp(firstName, lastName, email, password);

    const hashPass = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUND)
    );

    const user = new User({
      firstName,
      lastName,
      age,
      email,
      photoURL,
      gender,
      skills,
      about,
      password: hashPass,
    });
    const signedUser = await user.save();
    var token = await jwt.sign({ _id: signedUser._id }, process.env.JWT_SECRET);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true, // true for HTTPS
      sameSite: "None",
    });

    const userWithoutPassword = signedUser.toObject();
    delete userWithoutPassword.password;

    res.json({ message: "SignUp Successful", data: userWithoutPassword });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: " Invalid Credentials" });
    }
    const isValid = await user.isPassWorvalid(password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    var token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true, // true for HTTPS
      sameSite: "None",
    });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({ message: "Login successful", data: userWithoutPassword });
  } catch (err) {
    res.status(401).json({ message: "No user Found" });
  }
});
authRouter.post("/logout", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true, // true for HTTPS
    sameSite: "None",
  });
  res.send("logged out");
});
module.exports = authRouter;
