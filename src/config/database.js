const mongoose = require("mongoose");
const connectDB = async()=>{
    await mongoose.connect("mongodb+srv://taniyakamboj184:HcxO0w0G72h3C90v@cluster0.sncqn.mongodb.net/Tannu_web?retryWrites=true&w=majority&appName=Cluster0");

}

module.exports = connectDB;