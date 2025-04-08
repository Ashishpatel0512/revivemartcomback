const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type:Schema.Types.ObjectId,
    ref:"Users",
    required: true, 
    unique: true 
  },
  socketId: { type: String },
});

module.exports = mongoose.model("Soket", userSchema);
