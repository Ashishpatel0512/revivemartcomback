const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adsSchema = new Schema({
    
     Productid:{
       type:Schema.Types.ObjectId,
       ref:"Listing"
      },
      payment: {
       type:String,
       default:"unpaid"
     },
      status:{
       type:String,
       default:"pending"
       }

   });
  
module.exports= mongoose.model("Ads", adsSchema);
