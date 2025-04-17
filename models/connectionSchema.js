const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    fromUserid: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "UserTable",
    },
    toUserid: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "UserTable",
    },

    status: {
      type: String,
      required: true,
      enum: {
        values: ["accepted", "rejected", "interested", "ignored"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  {
    timestamps: true,
  }
);
connectionSchema.index({ fromUserid: 1, toUserid: 1 }); // compound index when query is dependentet on two para meteres
connectionSchema.pre("save", function (next) {
  if (this.fromUserid.equals(this.toUserid)) {
    throw new Error("Cannot Send Connection request to Yourself");
  } else {
    next();
  }
});
const Connection = mongoose.model("Connection", connectionSchema);
module.exports = Connection;
