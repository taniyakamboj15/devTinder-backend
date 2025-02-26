const jwt = require("jsonwebtoken");
const User = require("../models/users.js");

const userAuth = async(req,res,next)=>{
    try{
    const {token}= req.cookies;
    if(!token){
        throw new Error("invalid token");

    }
    const decodeobj=await jwt.verify(token,process.env.JWT_SECRET_KEY);
    const {_id} = decodeobj;
    const user = await User.findById(_id);
    if(!user){
        throw new Error("invalid credentials");

    }else{
        req.user=user;
        next();
    }
}catch(err){
    res.status(400).json({message:err.message});
}

}
module.exports = userAuth;