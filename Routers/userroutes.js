const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Users = require('../models/usermodel.js');
const Admins = require('../models/admin.js');
const Listing = require('../models/listingsmodel.js');
const bidings = require('../models/bidingmodel.js')
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const multer = require('multer')
const { storage } = require("../utility/cloudConfig.js")
const upload = multer({ storage })
require('dotenv').config();
// const passport = require("../config/passport");
const pass = require("passport");
var cors = require('cors')
const ExpressError = require("../utility/ExpressError.js");
const wrapAsync = require("../utility/wrapAsyc.js")
const Otp = require("../models/otp.js");
const sendMail = require("../config/sendmail.js")
const Ads = require("../models/ads.js");
const Message = require("../models/Message");
const Notify = require("../models/notification.js")
// REGISTER ROUTES
router.post('/register', wrapAsync(async (req, res) => {
  const { name, emailid, password } = req.body;
  console.log(name, emailid, password);
  if ([name, emailid, password].some((data) => data == undefined || data.trim() == "")) {
    return res.json(
      {
        success: false,
        ErrorMsg: "some field are empty please fill now!"

      }
    )
  }
  //check username emailid is exist or not in user table
  const user = await Users.findOne({ emailid: emailid });
  console.log(user);
  if (user) {
    return res.json({ success: false, ErrorMsg: "This emailid are alredy exits!" })
  }
  else {
    const salt = bcrypt.genSaltSync(10);
    let newuser = new Users({
      name,
      emailid,
      password: bcrypt.hashSync(password, salt)
    })
    await newuser.save().then((data) => {
      return res.json({ success: true, SuccessMsg: "Register SuccessFully! " })
    })

  }
}))

//LOGIN ROUTES

router.post("/login", wrapAsync(async (req, res) => {
  const { emailid, password } = req.body;
  console.log(emailid, password);
  if ([emailid, password].some((data) => data == undefined || data.trim() == "")) {
    return res.json({ success: false, ErrorMsg: "some field are empty please fill now!" })
  }
  else {
    const user = await Users.findOne({ emailid });
    console.log("user", user);
    if (user?.emailid == emailid) {
      if (!(bcrypt.compareSync(password, user.password))) {
        return res.json({ success: false, ErrorMsg: "Password is incorrect!" })
      }
      else {
        if (user.status == 'Block') {
          return res.json({ success: false, ErrorMsg: "You Are Block!" })
        }
        else {
          console.log(user._id)
          const token = jwt.sign({ user }, "codexlab", { expiresIn: "1d" })
          console.log(token);
          return res.json(
            {
              success: true,
              SuccessMsg: "login successgfully",
              token: "Bearer " + token,
              user: user
            }
          )
        }
      }
    }
    else {
      return res.json(
        {
          success: false,
          ErrorMsg: "emailid is incorrect!",
        }
      )
    }
  }

}))

//admin login
router.post("/adminlogin", wrapAsync(async (req, res) => {
  const { emailid, password } = req.body;
  console.log(emailid, password);
  if ([emailid, password].some((data) => data == undefined || data.trim() == "")) {
    return res.json({ success: false, ErrorMsg: "some field are empty please fill now!" })
  }
  else {
    const user = await Admins.findOne({ emailid });
    console.log("user", user);
    if (user?.emailid == emailid) {
      if (!(bcrypt.compareSync(password, user.password))) {
        return res.json({ success: false, ErrorMsg: "Password is incorrect!" })
      }
      else {
        
        
          console.log(user._id)
          const token = jwt.sign({ user }, "codexlab", { expiresIn: "1d" })
          console.log(token);
          return res.json(
            {
              success: true,
              SuccessMsg: "login successgfully",
              token: "Bearer " + token,
              user: user
            }
          )
       
      }
    }
    else {
      return res.json(
        {
          success: false,
          ErrorMsg: "emailid is incorrect!",
        }
      )
    }
  }

}))


//post add routed
router.post('/newproduct', pass.authenticate("jwt", { session: false }), upload.fields([{ name: 'image', maxCount: 6 }]), wrapAsync(async (req, res) => {
  console.log(req.files);
  let { name, description, price, age, latitude,longitude, catagory, other } = req.body;
  console.log(name, description, price, age, latitude,longitude , catagory, other)

  console.log(req.user);

  if ([name, description, price, age, catagory, other].some((data) => data == undefined || data.trim() == "")) {
    return res.json({ success: false, ErrorMsg: "some field are empty please fill now!" })
  }
  const list = new Listing(
    {
      name, description, price, age, location:{
        latitude,longitude
      }, catagory, other,
      image: req.files.image.map((file) => ({ url: file.path, filename: file.filename })),
      User: req.user
    }
  )
  console.log("HELLO I AM HERE...")
  list.save().then(() => {
    return res.json({ success: true, SuccessMsg: "post add successfully!" })
  })
}))

router.get("/showproducts/:productid", wrapAsync(async (req, res) => {
  const { productid } = req.params;
  console.log(productid);
  const list = await Listing.findById({ _id: productid }).populate('User');
  console.log(list);
  if (list) {
    return res.json({ success: true, productinfo: list })
  }
  else {
    return res.json({ success: false, ErrorMsg: "This product is not Availble!" })

  }
}
))

router.post("/editproduct/:productid", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  let { name, description, price, age,location, catagory, other } = req.body;
  console.log(name, description, price, age, location, catagory, other)
  console.log(req.user);
  const { productid } = req.params;

  let inputData = { name, description, price, age, location, catagory, other };

let product = {};

for (let key in inputData) {
    if (inputData[key] !== undefined && inputData[key] !== "") {
        product[key] = inputData[key];
    }
}

console.log("Filtered Product:", product);
  // if ([name, description, price, age, location, catagory, other].some((data) => data == undefined || data.trim() == "")) {
  //   return res.json({ success: false, ErrorMsg: "some field are empty please fill now!" })
  // }
  const post = await Listing.findByIdAndUpdate({ _id: productid }, product, {
    new: true,
  }).then((data) => {
    console.log(data)
    if (data == null) {
      return res.json({ success: false, ErrorMsg: "This product is not Availble!" })
    }
    else {
      return res.json({ success: true, SuccessMsg: "product updaates Successfully!" })
    }
  })

}))

router.get("/delete/:id", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  let id = req.params.id;
  console.log(id)
  let deleteproduct = await Listing.findByIdAndDelete(id);

  if (deleteproduct) {
    let d = await bidings.deleteMany({ "Productid": id });
    let ads = await Ads.deleteMany({ "Productid": id });
    return res.json({ success: true, SuccessMsg: "Post Delete Successfully!" })
  }
  else {
    return res.json({ success: false, ErrorMsg: "This post is not Availble!" })

  }
}))

//showproduct
router.get("/showproducts", wrapAsync(async (req, res) => {
  
  const { name, catagory, minprice, maxprice, minage, maxage } = req.query;
  console.log( name, catagory, minprice, maxprice, minage, maxage)
  const filters={}
  if (name && name !== "undefined") {
    filters.name = { $regex: name, $options: "i" }; // Case-insensitive search
  }
  
  if (catagory && catagory !== "undefined") {
    filters.catagory = { $regex: catagory, $options: "i" };
  }
  
  if (minprice && minprice !== "undefined") {
    filters.price = { ...filters.price, $gte: Number(minprice) };
  }
  
  if (maxprice && maxprice !== "undefined") {
    filters.price = { ...filters.price, $lte: Number(maxprice) };
  }
  
  if (minage && minage !== "undefined") {
    filters.age = { ...filters.age, $gte: Number(minage) };
  }
  
  if (maxage && maxage !== "undefined") {
    filters.age = { ...filters.age, $lte: Number(maxage) };
  }
  
  console.log("filters", filters)
  const orConditions = Object.entries(filters).map(([key, value]) => ({ [key]: value }));
  console.log("orConditions", orConditions)
  const products = await Listing.find({
    $and: [
      { status: "Approve" },
      { $or: orConditions }
    ]
    // $or: [
    //   filters
    //   // { name: { $regex: name, $options: "i" } },
    //   // { catagory: { $regex: catagory, $options: "i" } },
    //   // { price: { $gte: minprice, $lte: maxprice } }, // Price range filter
    //   // { age: { $gte: minage, $lte: maxage } } // Age range filter (1 to 3 years)
    // ]
  })
  console.log(products);
  if (products) {
    return res.json({ success: true, products })
  }
}))

router.get("/userdata", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  console.log(user);
  const User = await Users.findById({ _id: user._id });
  console.log(User);
  res.json({
    user: User
  })
}))
//admindata
router.get("/admindata", wrapAsync(async (req, res) => {
 const {authorization}=req.headers;
        console.log(authorization)
        const token = authorization.replace("Bearer ", "");
        console.log("token..........",token)
        const decoded = jwt.verify(token, 'codexlab');
  console.log("Decoded Token:............", decoded.user._id);
  
  const User = await Admins.findById({ _id: decoded.user._id });
  console.log(User);
  res.json({
    user: User
  })
}))
//user update
router.post("/editprofile", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  console.log(req.body)
  const { name, emailid } = req.body;
  const user = req.user;
  console.log(user);
  console.log(name, emailid)
  if ([name, emailid].some((data) => data == undefined || data.trim() == "")) {
    return res.json(
      {
        success: false,
        ErrorMsg: "some field are empty please fill now!"

      }
    )
  }
  const users = await Users.findOne({ emailid });
  console.log("CHECK USER", users);
  if (users.emailid !== user.emailid && users) {
    return res.json({ success: false, ErrorMsg: "THIS EMAILID IS ALREDY EXITS!" })

  }
  const User = await Users.findOneAndUpdate({ _id: user._id }, { name, emailid }, { new: true });
  console.log("user is edit profile.. ",User)
  if (User) {
    return res.json({ success: true, SuccessMsg: "Profile Update Successfully!",User })

  }
  else {
    return res.json({ success: false, ErrorMsg: "This user is not found!" })

  }


}))
//edit dp
router.post("/editdp", pass.authenticate("jwt", { session: false }), upload.single('dp'), wrapAsync(async (req, res) => {
  console.log(req.file);
  const user = req.user;
  const User = await Users.findByIdAndUpdate({ _id: user._id }, { new: true });
  console.log("user>>>", User)
  User.image.url = req.file.path;
  User.image.filename = req.file.filename;
  User.save();
  console.log("user is edit dp..",User)
  return res.json({ success: true, SuccessMsg: "Dp Update Successfully!",User })

}))


router.post('/bids/:productid', pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const { productid } = req.params;
  const user = req.user;
  console.log(user)
  const { bidamount, message, contact } = req.body;
  const product = await Listing.findOne({ _id: productid });
  console.log(product);
  if (product) {
    if ([bidamount, message, contact].some((data) => data == undefined || data.trim() == "")) {
      return res.json({ success: false, ErrorMsg: "some field are empty please fill now!" })

    }
    else {
      const biding = new bidings({
        bidamount, message, contact,
        User: user,
        Productid: product,
      })
      biding.save().then((data) => {
        console.log(data);
        return res.json({ success: true, SuccessMsg: "bid Add Successfully!" })

      })
    }
  }
  else {
    return res.json({ success: false, ErrorMsg: "product is not found !" })

  }

}))

router.delete('/deletebid/:bidid', pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const { bidid } = req.params;
  console.log(bidid);
  const user = req.user;
  console.log(user)
  const biding = await bidings.findById({ _id: bidid }).populate("User");
  console.log(biding)
  if (biding) {
    if (biding.User.id == user.id) {
      const deletebid = await bidings.findByIdAndDelete({ _id: bidid });
      console.log(deletebid);
      return res.json({ success: true, SuccessMsg: "Comment Delete Successfully!" })
    }
    else {
      return res.json({ success: false, ErrorMsg: "Athorized user only delete !" })

    }
  }
  else {
    return res.json({ success: false, ErrorMsg: "comment is not found !" })

  }

}))

//show bidss for particular product
router.get('/showbids/:productid', wrapAsync(async (req, res) => {
  const { productid } = req.params;
  console.log(productid);
  const bids = await bidings.find({ "Productid": productid }).populate("User Productid");
  console.log(bids);
  res.json({
    success: true,
    bids
  })
}))


//wishlist
router.get('/wishlist/:productid',pass.authenticate("jwt", { session: false }),wrapAsync(async(req,res)=>{
  const {productid}=req.params;
  console.log(productid);
  const user=req.user;
  const User=await Users.findByIdAndUpdate({_id:user._id},{ new: true });
  console.log("user.....",User);
  let result=User.wishlist.includes(productid);

  console.log(result)
  if(result){
      User.wishlist.pull(productid);
      User.save();
      res.json({
          success:true,
          wishlist:false,
          User
      })
  }
  else{
   User.wishlist.push(productid);
   User.save();
   res.json({
      success:true,
      wishlist:true,
      User
   })
  }
  

}))

router.get("/wishlist",pass.authenticate("jwt", { session: false }),wrapAsync(async(req,res)=>{
  const user=req.user;
  const User=await Users.findOne({_id:user._id}).populate('wishlist');
  console.log("user.....",User);
  console.log(User.wishlist);
  res.json({
    success:true,
    wishlist:User.wishlist

})
}))



//following
router.get("/following/:followuserid", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  const { followuserid } = req.params;
  console.log(user);
  console.log(followuserid);
  const User = await Users.findByIdAndUpdate({ _id: followuserid });
  console.log(User)
  const result = User.follwers.includes(user._id)
  console.log(result)
  if (result) {
    User.follwers.pull(user._id)
    const followuser = await Users.findByIdAndUpdate({ _id: user._id }, { upsert: true });
    followuser.follwing.pull(User);
    followuser.save()
    User.save();
    return res.json({ success: true, SuccessMsg: "unfollowing  Successfully!", follow: false })
  }
  User.follwers.push(user);
  const followuser = await Users.findByIdAndUpdate({ _id: user._id }, { upsert: true });
  console.log(followuser)
  console.log(User);
  followuser.follwing.push(User);
  followuser.save()
  User.save();
  return res.json({ success: true, SuccessMsg: "following  Successfully!", follow: true })
}))
// total followers and followings 
router.get("/followers", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const userid = req.user;
  console.log(userid)
  const user = await Users.findById({ _id: userid._id }).populate({ path: "followers", strictPopulate: false })

  const ids = user.follwers;
  let idsarr = [];
  ids.map((data) => {
    idsarr.push(data.toString())
  })
  console.log(idsarr)
  const totalfollowers = user.follwers.length;
  const totalfollowing = user.follwing.length;
  console.log(totalfollowers);
  console.log(totalfollowing);
  const users = await Users.find({ _id: { $in: idsarr } })
  console.log(users)
  res.json({
    success: true, totalfollowers, totalfollowing
  })

}))

router.get("/user/followers", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  console.log(user)
  const User = await Users.findById({ _id: user._id });
  const ids = User.follwers;
  const followingids = User.follwing;
  let idsarr = [];
  let followingidsarr = [];
  ids.map((data) => {
    idsarr.push(data.toString())
  })
  followingids.map((data) => {
    followingids.push(data.toString())
  })
  console.log(idsarr)
  const followers = await Users.find({ _id: { $in: idsarr } })
  const following = await Users.find({ _id: { $in: followingids } })

  console.log(followers)
  res.json({
    success: true, followers: followers, following: following

  })
}))

router.get("/user", wrapAsync(async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization)
    const token = authorization.replace("Bearer ", "");
    console.log(token)
    const decoded = jwt.verify(token, 'codexlab');
    console.log("Decoded Token:", decoded);
    const user = await Users.findById({ _id: decoded.user._id });
    res.json({
      success:true,
      user: user
    })
  } catch (error) {
    console.log(error)
    next()
  }

}))

router.get("/userproduct", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  const products = await Listing.find({ 'User': user._id });
  res.json(
    {
      success: true,
      products
    }
  )
}))
// userbids
router.get("/userbids", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  const bids = await bidings.find({ 'User': user._id }).populate('User Productid');
  console.log("userbids....",bids)
  res.json(
    {
      success: true,
      bids
    }
  )
}))

router.get("/profile/:userid", wrapAsync(async (req, res) => {
  const { userid } = req.params;
  console.log(userid)
  const user = await Users.findById({ _id: userid });
  const listing = await Listing.find({ 'User': userid });

  res.json(
    {
      user,
      listing
    }
  )
}))

router.post("/otp", async (req, res) => {

  let { emailid } = req.body;
  console.log(emailid)
  if (!emailid) {
    return res.json({
      success: false, // Proceed to password change
      message: "email is required!"
    });
  }
  const user = await Users.findOne({ emailid: emailid })
  if (!user) {
    return res.json({
      success: false, // Proceed to password change
      message: "emailid is not found!"
    });
  }
  async function generateOtp(email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    // Remove any existing OTP for the email
    await Otp.deleteMany({ email });

    // Create a new OTP entry
    await Otp.create({ email, otp });

    sendMail(otp, email)
    console.log(`OTP for ${email}: ${otp}`);
    res.json({ success: true, email })
  }
  generateOtp(emailid)

})

router.post("/verify", (req, res, next) => {
  try {
    let { emailid, otp } = req.body;
    console.log(otp)
    console.log(emailid)

    async function verifyOtp(email, inputOtp) {
      const otpRecord = await Otp.findOne({ email, otp: inputOtp });

      if (otpRecord) {
        console.log('OTP verified');
        // Remove the OTP document after verification
        await Otp.deleteOne({ _id: otpRecord._id });
        return res.json({ success: true, email });
      }
      else {
        console.log('Invalid or expired OTP');
        return res.json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }
    }
    verifyOtp(emailid, otp);
  } catch (error) {
    next(error)
  }

})

// change password

router.post("/forgot/password", (req, res) => {
  let { emailid, password } = req.body;

  if (!emailid || !password) {
    return res.json({
      success: false,
      message: "emailid && password is empty please fill now"
    })
  }
  else {
    const salt = bcrypt.genSaltSync(10);
    let update = Users.findOneAndUpdate({ emailid }, { password: bcrypt.hashSync(password, salt) }, {
      new: true,
      upsert: true
    }).then((data) => {
      console.log(data);
      if (!data) {
        return res.json({
          success: false,
          message: "emailid && password is false please try again"
        })
      }
      else {
        res.json({ success: true, message: "password update successfully" })
      }
    })

  }
})
// THIS IS A CHAT ROUTES 
router.get("/messages", async (req, res) => {
  try {
    const { username,receiver } = req.query;
    if (!username) return res.status(400).json({ error: "Username is required" });

    // Find messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: username, receiver: receiver },
        { sender: receiver, receiver: username }
    ]
    }).populate('sender receiver').sort({ createdAt: 1 }); // Sort messages by time

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/groupmessages", async (req, res) =>{
  try {
      const { username } = req.query;
      if (!username) return res.status(400).json({ error: "Username is required" });

      // Fetch messages where the user is either sender or receiver
      const messages = await Message.find({
          $or: [{ sender: username }, { receiver: username }]
      }).populate('sender receiver').sort({ createdAt: 1 });
     
      // Group messages based on sender-receiver pair
      let groupedMessages = {};

      messages.forEach((msg) => {
          // Create a unique key for each conversation pair (sorted)
          let chatKey = [msg.sender._id, msg.receiver._id].sort().join("_");

          if (!groupedMessages[chatKey]) {
              groupedMessages[chatKey] = { participants: [msg.sender, msg.receiver], messages: [] };
          }
          
        groupedMessages[chatKey].messages.push({
            msg:msg
              // sender: msg.sender,
              // receiver: msg.receiver,
              // text: msg,
              // createdAt: msg.createdAt
          });
      });

      res.json(Object.values(groupedMessages)); // Convert object to array for response
  } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

//ads routes
router.post("/ads/:productid", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const { productid } = req.params;
  const user = req.user;
  console.log(user)
  const product = await Listing.findOne({ _id: productid });
  console.log(product);
  // check ads is already exist or not
  const ads = await Ads.findOne({ Productid: productid });
  console.log(ads)
  if (ads) {
    return res.json({ success: false, ErrorMsg: "Ads is already exist!" })
  }
  else {
    if (product) {
      const ads = new Ads({
        Productid: product,
        payment: "paid",
      })
      ads.save().then((data) => {
         console.log(data);
         return res.json({ success: true, SuccessMsg: "Ads Add Successfully!" })
       })
    }
    else {
         return res.json({ success: false, ErrorMsg: "product is not found !" })
        }
  }
     
  



  // if (product) {
  //   const ads = new Ads({
  //     Productid: product,
  //     payment: "paid",
  //   })
  //   ads.save().then((data) => {
  //      console.log(data);
  //      return res.json({ success: true, SuccessMsg: "Ads Add Successfully!" })
  //    })
  // }
  // else {
  //      return res.json({ success: false, ErrorMsg: "product is not found !" })
  //     }
}))

//find ads
router.get("/ads", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const ads = await Ads.find({}).populate("Productid")
  console.log(ads,".........................................................................................................");
  res.json({
    success: true,
    ads
  })
}))

// find approve ads..
router.get("/showads",  wrapAsync(async (req, res) => {
  const ads = await Ads.find({}).populate("Productid")
  const adsdata = ads.filter(ads => ads.Productid.status === "Approve");

  // console.log(data,".........................................................................................................");
  res.json({
    success: true,
    adsdata
  })
}))


// set notification token and update user
router.get("/notificationtoken/:notificationtoken", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  const { notificationtoken } = req.params;
  console.log(user._id, notificationtoken)
  const User = await Users.findByIdAndUpdate({ _id: user._id }, { notificationtoken }, { new: true });
  console.log(User)
  res.json({
    success: true,
    User
  })
}))
// notification fetch particular user
router.get("/notification", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const user = req.user;
  console.log(user._id)
  const Notification = await Notify.find({ receiver: user._id })
  console.log(Notification)
  res.json({
    success: true,
    Notification
  })
}
))

// delete notification
router.delete("/notification/:id", pass.authenticate("jwt", { session: false }), wrapAsync(async (req, res) => {
  const {id}= req.params;
  const Notification = await Notify.findByIdAndDelete({_id:id})
  console.log(Notification)
  res.json({
    success: true,
    SuccessMsg:'delete notification successfully'
  })
}
))
module.exports = router