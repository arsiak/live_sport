var express = require('express');
var router = express.Router();

let User = require("../models/user.js");

// define the home page route
router.get('/', function(req, res) {
    let user = new User();
    user.username = req.session.admin;
    user.save(function(err){
        if(err){
            console.log(err);
            return;
        }else{
            console.log("OK");
        }
    });
    res.render('admin');
});

// define the home page route
router.get('/yolo', function(req, res) {
    res.render('admin');
});

module.exports = router;