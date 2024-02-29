const express = require("express");
require("dotenv").config(); //biến môi trường
const userRouter = require("./routers/userRoute");
const app = express();

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
