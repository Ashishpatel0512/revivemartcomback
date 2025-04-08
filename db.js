const mongoose = require("mongoose");

function datacon(){
    main().then(() => {
        console.log("connected to database");
      }).catch(err => console.log(err));
      
      async function main() {
        await mongoose.connect('mongodb://127.0.0.1:27017/revivemartcom');
        
      }
}

module.exports=datacon;