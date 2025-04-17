const User = require("../models/userSchema");

const emailAuth = async (req, res, next) => {
  const { email } = req.body;
  const alreadyUser = await User.findOne({ email: email });
  if (!alreadyUser) {
    next();
  } else {
    res.status(401).json({ message: "Email already in use" });
  }
};
module.exports = emailAuth;
