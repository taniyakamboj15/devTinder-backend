const mongoose = require("mongoose");
const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://taniyakamboj184:Taniya%40184@cluster0.sncqn.mongodb.net/Tannu_web?retryWrites=true&w=majority&appName=Cluster0");

}

module.exports = connectDB;