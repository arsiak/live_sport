var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt");

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
    if(typeof req.session.admin != "undefined" || typeof req.session.client != "undefined"){
        res.redirect('/cdm');
    }else{
        res.setHeader('Content-Type','text/html');
        res.render('pseudo');
    }
    // let article = new Article();
    // article.title = "article two";
    // article.yolo = req.body.field;
    // article.author = "arnaud";
    // article.body ="erfj";
    // article.save(function(err){
    //   if(err){
    //     console.log(err);
    //     return;
    //   }else{
    //     console.log("OK");
    //   }

    //Récupérer tous les articles de la base
    // Article.find({}, function(err, articles){
    //   if(err) {
    //     console.log(err);
    //   } else {
    //     res.render('index', {
    //       title : "yolo",
    //       articles : articles,
    //     });
    //   }
    // });

    //Ferme la co à la BD
    //mongoose.connection.close(); 
});

router.post('/cdm', function(req,res){
    pseudo = req.body.pseudo;
    //Intérroger la base de données pour savoir si le pseudo existe déjà
    var uni = true;
    let User = require('../models/user.js');
    User.findOne({username : pseudo}, function(err, user){
        if(user === null){
            //Si oui rediriger vers / et afficher les erreurs à l'utilisateur, également lorsque pas rentré de pseudo
            //res.render('pseudo')
            uni = false;
        }else{
            uni = true
            //Si non enregistrer l'utilisateur dans la base
            // Enregistrer l'utilisateur en session
            // Afficher la page CDM
            res.render('cdm');
        }
    });
    console.log(uni)
    // console.log(unique);
})



module.exports = router;