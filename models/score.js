let mongoose = require('mongoose');

// Customers schema
let scoreSchema = mongoose.Schema({
    score1 : {
        type : Number,
    },
    score2 : {
        type : Number,
    }
});

let Score = module.exports = mongoose.model('Score', scoreSchema);