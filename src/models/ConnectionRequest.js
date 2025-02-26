const mongoose = require("mongoose");
const ConnectionRequestSchema = new mongoose.Schema({
    fromUserId:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:"User"
    },

      toUserId:{
            type:mongoose.SchemaTypes.ObjectId,
            required:true,
            ref:"User"
        },
        status:{
            type:String,
            required:true,
            enum:{
                values:["ignored","accepted","interested","rejected"],
                message:`{VALUE} is incorrect status type`,

            }
        }

},{
    timestamps:true,
})
const Connection = mongoose.model("Connection",ConnectionRequestSchema);
module.exports = Connection;