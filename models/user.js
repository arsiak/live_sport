let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  username: {
    type : String,
    required : [true, "can't be blank"],
    index : {
        unique : true,
    }
  },
});

let User = module.exports = mongoose.model('User', UserSchema);