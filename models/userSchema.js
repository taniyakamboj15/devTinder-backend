const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String, required: true },
    age: { type: Number, required: true, min: [18, "only 18+"] },
    email: { type: String, required: true, immutable: true },
    photoURL: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?t=st=1738447354~exp=1738450954~hmac=b79dc7d685da55c34ebce56ebd9416e0b6cd2758a3e41751e3de41fe7ae70253&w=740",
    },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    skills: { type: [String], default: [] },
    about: {
      type: String,
      default: "This default user about.",
      maxlength: [80, "About section must not exceed 80 characters."],
    },
  },
  { timestamps: true }
);
UserSchema.methods.isPassWorvalid = async function (userInputPass) {
  const user = this;

  const isPass = await bcrypt.compare(userInputPass, user.password);
  return isPass;
};
UserSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("UserTable", UserSchema);
module.exports = User;
