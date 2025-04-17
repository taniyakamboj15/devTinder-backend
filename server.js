const express = require("express");
const app = express();
const conectDB = require("./config/databse");
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const intializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chatRouter");
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://devtinder.taniyakamboj.info",
      "https://devtinder.abhinavranjan.me",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", (req, res) =>
  res.status(201).json({ message: "DevTinder Running" })
);
app.use("/", (req, res, err) => {
  //
  if (err) {
    res.status(500).send("something went wrong");
  }
});
const server = http.createServer(app);
intializeSocket(server);

conectDB()
  .then((result) => {
    console.log("databse connected sucessfully");
    server.listen(process.env.PORT, () => {
      console.log("Server Connected successfully");
    });
  })
  .catch((err) => {
    console.log("db not connected");
  });
