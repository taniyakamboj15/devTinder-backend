const mongoose = require("mongoose");
require("dotenv").config();
const conectDB = async () => {
  await mongoose.connect(process.env.DATABASE_URI);
};
module.exports = conectDB;
