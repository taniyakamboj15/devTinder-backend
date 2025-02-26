const express = require("express");
const connectDB = require("./config/database.js");
const User = require("./models/users.js");
const validateSignUPData = require("./utils/validate.js");
const userAuth = require("./middleware/auth.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const Connection = require("./models/ConnectionRequest.js");
require("dotenv").config();

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:1234",
  methods: "GET, POST, PATCH, PUT, DELETE,OPTIONS",
  allowedHeaders: "Content-Type",
  credentials: true
}));

app.use(express.json());


app.post("/signup",async(req,res)=>{
    try{
        validateSignUPData(req);
        const {firstName,lastName,email,age,photoURL,password}=req.body;
        const passwordHash = await bcrypt.hash(password,10);
    const user = new User({
        firstName,
        lastName,
        email,
        age,
        photoURL,
        password:passwordHash,
    });
    const saveUser = await user.save();
    const token = await jwt.sign({_id:saveUser._id},"Taniya@123");
        res.cookie("token",token);
    res.json({message:"signup successfull",data:saveUser});
    }catch(err){
 res.status(400).json({message:err.message});
}


})
app.post("/login",async(req,res)=>{
    try{
    const {email,password}= req.body;
    const users = await User.findOne({email:email});
    if(!users){
        return res.status(400).json({message:"invalid email"});
    }
    const isPasswordValid = await bcrypt.compare(password,users.password);
    if(isPasswordValid){
        const token = await jwt.sign({_id:users._id},"Taniya@123");
        res.cookie("token",token);
        return res.json({message:"login successfull", data:users});
        
    }else{
       return res.status(400).json({message:"invalid password"});

    }
}catch(err){
    return res.status(400).send(err.message);
}


})
app.post("/logout",(req,res)=>{
    res.clearCookie("token");
    res.send("logout successfull");

})
app.get("/profile/view",userAuth ,async(req,res)=>{
    try{
        const user=req.user;
        res.json({message:"successfull",data:user});
    }catch(err){
        res.status(401).json({message:err.message});
    }
})
app.put("/profile/edit", userAuth, async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*');
    const user = req.user;
    const allowed_Updates = ["firstName", "lastName", "age", "photoURL"];
    const isUpdateAllowed = Object.keys(req.body).every((k) =>
      allowed_Updates.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not Allowed");
    }
    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.json({ message: `${user.firstName} your profile updated succefully `, data:user});
  }catch(err) {
    res.status(401).json({ errorhai: err.message });
  }
});
app.post(
    "/request/send/:status/:userId",
    userAuth,
    async (req, res) => {
      const fromUser = req.user._id;
  
      try {
        const toUser = req.params.userId;
        const status = req.params.status;
        if (!fromUser || !toUser || !status) {
          return res.status(401).json({ error: "Invalid request" });
        }
        // if (toUser === fromUser) {
        //   res.status(401).json({ message: "Invalid" });
        // }
        const allowed_Updates = ["interested", "ignored"];
        if (!allowed_Updates.includes(status)) {
          throw new Error("Invalid Request");
        }
        const isToUserValid = await User.findById({ _id: toUser });
        if (!isToUserValid) {
          return res.status(401).json({ error: "No such User Exists" });
        }
        const existingConnection = await Connection.findOne({
          $or: [
            {
              fromUserId: fromUser,
              toUserId: toUser,
            },
            {
              fromUserId: toUser,
              toUserId: fromUser,
            },
          ],
        });
  
        if (existingConnection) {
          return res
            .status(409)
            .json({ message: "Connection request already sent" });
        }
  
        // Create and save new connection
        const connection = new Connection({
          fromUserId: fromUser,
          toUserId: toUser,
          status,
        });
        await connection.save();
  
        res
          .status(201)
          .json({ message: `Connection request sent to user ${toUser}` });
      } catch (error) {
        res.status(400).send(error.message);
      }
    }
  );
app.put(
    "/request/review/:status/:connectionId",
    userAuth,
    async (req, res) => {
      const loggedUserId = req.user._id;
  
      try {
        const status = req.params.status;
        const connectionId = req.params.connectionId;
        if (!loggedUserId || !status) {
          return res.status(401).json({ error: "Invalid request" });
        }
        const allowed_Updates = ["rejected", "accepted"];
  
        // if (toUser === fromUser) {
        //   res.status(401).json({ message: "Invalid" });
        // }
        if (!allowed_Updates.includes(status)) {
          throw new Error("Not allowed");
        }
  
        const interestedUser = await Connection.findOne({
          _id: connectionId,
          toUserId: loggedUserId,
          status: "interested",
        });
        if (!interestedUser) {
          return res
            .status(401)
            .json({ error: "Cannot accept without sending request " });
        }
  
        // Create and save new connection
        interestedUser.status = status;
        await interestedUser.save();
  
        res.status(201).json({ message: `${status}` });
      } catch (error) {
        res.status(400).send(error.message);
      }
    }
  );
app.get("/user/requests/received", userAuth, async (req, res) => {
    const userId = req.user._id;
  
    try {
      if (!userId) {
        throw new Error("Please Login");
      }
      const userRequests = await Connection.find({
        toUserId: userId,
        status: "interested",
      }).populate("fromUserId", ["firstName", "lastName", "photoURL","age"]);
      if (!userRequests) {
        throw new Error("No Requests Available");
      }
      res.json({ data: userRequests });
    } catch (err) {
      res.status(401).send(err.message);
    }
  });
app.get("/user/connection", userAuth, async (req, res) => {
    const userId = req.user._id;
  
    try {
      if (!userId) {
        throw new Error("Please Login");
      }
      const userRequests = await Connection.find({
        $or: [
          {
            toUserId: userId,
            status: "accepted",
          },
          {
            fromUserId: userId,
            status: "accepted",
          },
        ],
      })
        .populate("fromUserId", "firstName lastName photoURL email age")
        .populate("toUserId", "firstName lastName photoURL email age");
      if (!userRequests) {
        throw new Error("Not yet sent connection");
      }
      const connectionData = userRequests.map((row) => {
        if (row.fromUserId._id.toString() === userId.toString()) {
          // WE CANNOT COMPARE OBJECT LIKELY ====
          return row.toUserId;
        } else {
          return row.fromUserId;
        }
      });
      res.json({
        data: connectionData,
      });
    } catch (err) {
      res.status(401).send(err.message);
    }
  });
app.get("/user/feed", userAuth, async (req, res) => {
    const loggedUser = req.user;
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const skip = (page - 1) * limit;
      const connectedUser = await Connection.find({
        $or: [
          {
            toUserId: loggedUser._id,
          },
          {
            fromUserId: loggedUser._id,
          },
        ],
      }).select("fromUserId toUserId -_id");
      const hiddenUser = new Set(); // 
      connectedUser.forEach((req) => {
        hiddenUser.add(req.fromUserId.toString());
        hiddenUser.add(req.toUserId.toString());
      });
      const users = await User.find({
        $and: [
          { _id: { $nin: Array.from(hiddenUser) } }, // [...hiddenUser]
          {
            _id: {
              $ne: loggedUser._id,
            },
          },
        ],
      })
        .select("firstName lastName photoURL email age")
        .skip(skip)
        .limit(limit);
      res.json({data:users});
    } catch (error) {
      res.status(401).json({message:error.message});
    }
  });
  
connectDB().then(()=>{
    console.log("database connected successsfully");
    app.listen(process.env.PORT,()=>{
        console.log("server connected successfully");
    });
}).catch(()=>{
    console.log("database cannot be connected");
});

