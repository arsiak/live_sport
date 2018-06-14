var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt");
var ent = require("ent");

// Bring in Models
let Article = require('../models/article');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// Bring in Models
let Admin = require('../models/admin');

router.get("/login", function (req, res) {
    res.setHeader('Content-Type','text/html');
    res.render('login',{"error": null });
});

router.post("/login", function (req, res) {
    req.body.username = ent.encode(req.body.username);
    req.body.password = ent.encode(req.body.password);
    if (req.body.username && req.body.password) {
        var adminData = {
            username : req.body.username,
            password : req.body.password,
        }
        Admin.findOne({username:adminData.username}, function(err, admin) {
            if(err)
                throw err;
            if(admin){
                bcrypt.compare(adminData.password, admin.password, function(err, isMatch) {
                    if (err) 
                        throw err;
                    if(isMatch){
                        req.session.admin = adminData.username;
                        req.session.user = adminData.username;
                        res.redirect('/admin');
                    }else{
                        res.redirect('/login');
                    }
                });
            }
        });
    }
});


router.get('/', function(req,res){
    //Ajouter un article dans la base
    if(typeof req.session.admin != "undefined" || typeof req.session.user != "undefined"){
        res.redirect('/cdm');
    }else{
        res.setHeader('Content-Type','text/html');
        res.render('pseudo');
    }
});

let User = require('../models/user.js');
router.post('/cdm', function(req,res){
    pseudo = ent.encode(req.body.pseudo);
    //Intérroger la base de données pour savoir si le pseudo existe déjà
    User.findOne({username : pseudo}, function(err, user){
        if(user !== null){
            //Si oui rediriger vers / et afficher les erreurs à l'utilisateur, également lorsque pas rentré de pseudo
            res.redirect('/')
        }else{
            //Si non enregistrer l'utilisateur dans la base
            let user = new User();
            user.username = pseudo;
            user.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }else{
                    console.log("OK");
                }
            });
            // Afficher la page CDM
            req.session.user = pseudo;
            res.render('cdm', {username : pseudo});
        }
    });
});

router.get('/cdm',function(req,res){
    if(typeof req.session.user != "undefined"){  
        res.render('cdm');
    }else{
        res.redirect('/')
    }
});

module.exports = router;