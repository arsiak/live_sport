let mongoose = require('mongoose');

let MessageSchema = new mongoose.Schema({
  message: {
    type : String,
  },
});

let Message = module.exports = mongoose.model('Message', MessageSchema);