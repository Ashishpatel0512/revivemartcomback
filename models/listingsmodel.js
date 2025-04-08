const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
   name: {
    type:String,
    required: true
  },
  description: {
    type:String,
    required: true
  },
  image:[ {
    url:String,
    filename:String
  }],

  price: {
    type:Number,
    required: true
  },
  catagory: {
    type:String,
    required: true
  },
  age: {
    type:Number,
    required: true
  },
  location:{
    latitude: Number,
    longitude: Number,
  
  },
status:{
  type:String,
  default:"pending"

},
other:String,

createAt:{
    type:Date,
    default:Date.now()

 },

  User:[{
    type:Schema.Types.ObjectId,
    ref:"Users"
  }]
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;