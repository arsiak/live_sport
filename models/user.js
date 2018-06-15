let mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
  username: {
    type : String,
    required : [true, "can't be blank"],
  },
});

let User = module.exports = mongoose.model('User', UserSchema);