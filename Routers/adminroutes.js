const express = require('express');
// const admin = require("firebase-admin");
const sendNotification = require('../utility/sendnotification.js')
const router=express.Router();
const Users = require('../models/usermodel.js');
const Listing = require('../models/listingsmodel.js');
const Ads = require("../models/ads.js");
const bidings = require('../models/bidingmodel.js')

require('dotenv').config();
// const passport = require("../config/passport");
const wrapAsync = require("../utility/wrapAsyc.js")
// const serviceAccount = require("../serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount), // એડમિન માટે auth key
// });

router.get("/admin/userdata",wrapAsync(async(req,res)=>{
    const userdata=await Users.find();
    console.log(userdata);
    const listdata=await Listing.find().populate('User');
    console.log(listdata)
    res.json(
        {
            userdata:userdata,
            listdata:listdata
        }
    )
}))
router.get("/admin/userdata/:userid",async(req,res)=>{
       const {userid}=req.params;
            console.log(userid)
            const user=await Users.findById({_id:userid});
            const lists=await Listing.find({'User':userid});
            
            res.json(
                {
                    user,
                    lists
                }
             )
})

//delete post- admin
router.delete("/admin/deletepost/:listid",async(req,res)=>{
    const {listid}=req.params;
    const deletepost = await Listing.findByIdAndDelete({ _id: listid });
     if (deletepost) {
        let d = await bidings.deleteMany({ "Productid":listid });
        let ads = await Ads.deleteMany({ "Productid": listid });
        return res.json({ success: true, SuccessMsg: "Post Delete Successfully!" })
      }
    // res.json(
    //     {
    //         success:true,  SuccessMsg:"Post Delete  Successfully!"
    //     }
    // )
})
router.get("/admin/deleteuser/:userid",async(req,res)=>{
    const {userid}=req.params;
    const deleteuser=await Users.findByIdAndDelete({_id:userid});
    res.json(
        {
            success:true,  SuccessMsg:"User Delete  Successfully!"
        }
    )
})

//approve
router.put("/admin/approveproduct/:listid",async(req,res)=>{
    const {listid}=req.params;
    const approvepost = await Listing.findByIdAndUpdate({ _id: listid }, { status: "Approve" });
    //notification
    const user = await Users.findById(approvepost.User[0]);

    // const message = {
    //     notification: {
    //       title: 'Approve', // Notification નો title
    //       body:`Approve your product ${approvepost.name}` // Notification નો message body
    //     },
    //     token:user?.notificationtoken , // User નો Firebase token
    //   };

    // const response = await admin.messaging().send(message);
    // console.log("Notification મોકલાઈ ગયું:", response);✅ Your car listing has been approved and is now live.
    sendNotification (user?.notificationtoken,'Approve',`✅ Your ${approvepost.name} listing has been approved and is now live. `)
    
    res.json(
        {
            success:true,  SuccessMsg:"product update  Successfully!",user,approvepost
        }
    )
})
router.put("/admin/rejectproduct/:listid",async(req,res)=>{
    const {listid}=req.params;
    const rejectpost = await Listing.findByIdAndUpdate({ _id: listid }, { status: "Reject" });
    const user = await Users.findById(rejectpost.User[0]);

    sendNotification (user?.notificationtoken,'Reject',`❌ Your ${rejectpost.name} listing has been rejected. Please review our guidelines and try again.`)

    res.json(
        {
            success:true,  SuccessMsg:"product update  Successfully!",user,rejectpost
        }
    )
})

//block-user
router.put("/admin/blockuser/:userid",async(req,res)=>{
    const {userid}=req.params;
    const rejectpost = await Users.findByIdAndUpdate({ _id: userid }, { status: "Block" });
    const lists =await Listing.updateMany({ "User": userid }, { $set: { status: 'Block' } })
    res.json(
        {
            success:true,  SuccessMsg:"user status update  Successfully!"
        }
    )
})
// unblock-user
router.put("/admin/unblockuser/:userid",async(req,res)=>{
    const {userid}=req.params;
    const rejectpost = await Users.findByIdAndUpdate({ _id: userid }, { status: "Active" });
    const lists =await Listing.updateMany({ "User": userid }, { $set: { status: 'pending' } })

    res.json(
        {
            success:true,  SuccessMsg:"user status update  Successfully!"
        }
    )
})

//find ads
router.get("/admin/ads", wrapAsync(async (req, res) => {
  const ads = await Ads.find({}).populate("Productid")
  console.log(ads,".........................................................................................................");
  res.json({
    success: true,
    ads
  })
}))
//promotion manage
router.put("/admin/rejectads/:adsid",async(req,res)=>{
    const {adsid}=req.params;
    const rejectpost = await Ads.findByIdAndUpdate({ _id: adsid }, { status: "Reject" });


    res.json(
        {
            success:true,  SuccessMsg:"ads update  Successfully!",rejectpost
        }
    )
})
router.put("/admin/approveads/:adsid",async(req,res)=>{
    const {adsid}=req.params;
    const approvepost = await Ads.findByIdAndUpdate({ _id: adsid }, { status: "Approve" });


    res.json(
        {
            success:true,  SuccessMsg:"ads update  Successfully!",approvepost
        }
    )
})
module.exports=router