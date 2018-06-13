var express = require('express');
var router = express.Router();

// define the home page route
router.get('/', function(req, res) {
    res.render('admin');
});

// define the home page route
router.get('/yolo', function(req, res) {
    res.render('admin');
});

module.exports = router;