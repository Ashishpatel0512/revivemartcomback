require('dotenv').config();
// const admin = require("firebase-admin");

const express = require('express')
const http = require("http");
const { Server } = require("socket.io");
const app = express()
const port=3000
const bodyParser = require('body-parser');
require('dotenv').config();
const multer  = require('multer')
const {storage}=require("./utility/cloudConfig.js")
const upload = multer({ storage })
const Message = require("./models/Message");
const Soket=require("./models/soket.js")
var cors = require('cors')
const dataconnection=require('./db.js')
// const mongoose = require("mongoose");
// const Users=require('./models/usermodel.js');
// const Posts=require('./models/.js');
const userrouter=require('./Routers/userroutes.js');
const adminrouter=require('./Routers/adminroutes.js');
const passport = require("./config/passport");
const zlib = require('zlib');
const fs = require('fs');
const ExpressError = require("./utility/ExpressError.js");

// const serviceAccount = require("./serviceAccountKey.json");

// database connection
dataconnection();


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount), // એડમિન માટે auth key
// });

//middelware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
const corsOptions = {
   // Only allow GET and POST requests
   methods: ['GET', 'POST', 'PUT', 'DELETE'],
 };
 
 app.use(cors(corsOptions));
 app.use(passport.initialize());

 
//

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })
app.use('/',userrouter);
app.use("/", adminrouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "somethig went wrong please try again"))
})


app.use((err, req, res, next) => {
  let { statusCode = 500, message = "somethings went wrong" } = err;
  //react
  console.log("msg", message)
  // res.status(statusCode).render("error.ejs",{message});
  return res.json({
    success: false,
    ErrorMsg: message
  })
  // res.status(statusCode).json({message});
})

// soket connection//////////////////////////////////////////////////////////
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("register", async (username) => {
    await Soket.findOneAndUpdate(
      { username },
      { socketId: socket.id },
      { upsert: true }
    );
  });

  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    const receiverUser = await Soket.findOne({ username: receiver._id });
    if (receiverUser) {
      io.to(receiverUser.socketId).emit("receiveMessage", { sender, message,receiver });
    }
    await new Message({ sender, receiver, message }).save();
  });

  socket.on("disconnect", async () => {
    console.log("❌ User disconnected:", socket.id);
    await Soket.findOneAndDelete({ socketId: socket.id });
  });
});


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})