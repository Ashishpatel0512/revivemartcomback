const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userSchema = new Schema({
       name: {
      type:String,
      required: true
       },
       emailid: {
        type:String,
        required: true
      },
      password: {
        type:String,
        required: true
      },
      status: {
        type:String,
        default:"Active"

      },
      role: {
        type:String,
        default:"User"
  },
  notificationtoken:String,

      image: 
        {
        url:{
          type:String,
          default:"https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png"
        },
        filename:{
           type:String,
        default:"image.png"
        }
        },
        follwers:[
          {
        type:Schema.Types.ObjectId,
        ref:"Users"
          }
        ] ,
        follwing:[
          {
          type:Schema.Types.ObjectId,
          ref:"Users"
          }
        ] ,
        wishlist:[
          {
          type:Schema.Types.ObjectId,
          ref:"Listing"
          }
        ] ,

}
 );


  
module.exports= mongoose.model("Users", userSchema);
