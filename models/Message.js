const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type:Schema.Types.ObjectId,
    ref:"Users", 
    required: true
   },
  receiver: {
     type:Schema.Types.ObjectId,
     ref:"Users",
     required: true
     },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);
