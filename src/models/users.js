const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        immutable:true,
    },
    password:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        min:[18,"only 18+"]
        
    },
    photoURL:{
        type:String,
        default:"https://pinnacle.works/wp-content/uploads/2022/06/dummy-image.jpg"
    }


},{
    timestamps:true,
});
UserSchema.index({email:1},{unique:true});
const User = mongoose.model("User",UserSchema);
module.exports = User;