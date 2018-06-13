let mongoose = require('mongoose');

let AdminSchema = new mongoose.Schema({
  username: {
    type : String,
    required : [true, "can't be blank"],
    index : {
        unique : true,
    }
  },
  password : {
    type : String,
    required : true,
  }
});

let Admin = module.exports = mongoose.model('Admin', AdminSchema);