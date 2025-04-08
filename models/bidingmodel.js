const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bidingSchema = new Schema({
     bidamount: {
       type:Number,
      required: true

     },
     message: {
        type:String,
        required: true
      },
      contact: {
        type:String,
        required: true
      },
     createAt:{
        type:Date,
        default:Date.now()
    },
   
    User:{
      type:Schema.Types.ObjectId,
      ref:"Users"
    },
    
    Productid:{
      type:Schema.Types.ObjectId,
      ref:"Listing"
    },
  });
  
module.exports= mongoose.model("bidings", bidingSchema);
