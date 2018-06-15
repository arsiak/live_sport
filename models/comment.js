let mongoose = require('mongoose');

let CommentSchema = new mongoose.Schema({
  text: {
    type : String,
    required : [true, "can't be blank"],
  },
  equipe : {
    type : String,
  },
  type : {
    type : String,
  },
  minute : {
    type : Number,
  }
});

let Comment = module.exports = mongoose.model('Comment', CommentSchema);