const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Get the token from cookies

    // If there's no token, return an error
    if (!token) {
      return res.status(404).send("Access Denied: No Token Provided");
    }

    // Verify the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

    // Send the decoded object (which contains user data like _id)
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send("Invalid Credentials");
    } else {
      req.user = user;
      next();
    }
  } catch (err) {
    res.status(400).send(err.message); // Handle invalid token
  }
};
module.exports = userAuth;
