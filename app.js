const express = require('express');
const bodyParser = require('body-parser');
const ent = require('ent');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')({
  secret : 'keyboard cat',
  resave : false,
  saveUninitialized: true,
})
var sharedsession = require("express-socket.io-session");



//MONGO
//Si elle n'existe pas elle sera crée si une insertion est faite
//Créer un object connextion accessible via mongoose.connection
mongoose.connect('mongodb://localhost/live_sport');
let db = mongoose.connection;
// Check connnection
db.once('open', function(){
  console.log('Connected to mongoDB');
});
// Check for DB errors
db.on('error', function(err){
  console.log(err);
});


//Contrôle admin
function requireLogin(req, res, next) {
  // Si il le client est admin
  if (typeof req.session.admin != 'undefined'){
    next();
  }
  else{
    res.redirect('/login');
  }
}
//APP
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var admin = require('./routes/admin');
var main = require('./routes/main');
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.set('port', (process.env.PORT || 8080));

// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }
app.use(session);
app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/admin', requireLogin, admin);
app.use('/', main);

let User = require('./models/user.js');
let Message = require('./models/message.js');
let Score = require('./models/score.js');
let Comment = require('./models/comment.js');
let Equipe = require('./models/equipe.js');

var messages = [];
//SOCKET.IO
server.listen(app.get('port'), function(){
    console.log("Listening on port 8080...");
});
io.use(sharedsession(session));
// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) {
    var pseudo = socket.handshake.session.user;
    if(typeof socket.handshake.session.admin != "undefined"){
      pseudo = socket.handshake.session.admin;
    }
    console.log(pseudo);
    socket.handshake.session.destroy();

    socket.broadcast.emit("connexion:notif", pseudo);
    User.find({}).then(function(users){
      io.emit("connexion:getUsers", users);
    });

    socket.emit("connexion:getMessages", messages);

    //récupérer les commentaires
    Comment.find({}).sort({"_id":-1}).then(function(comments){
      socket.emit("comments:printComments", comments);
    })

    //Récupère les équpes
    Equipe.find({}).then(function(equipes){
      socket.emit("equipe:printEquipe", equipes);
    });

    //Récupérer le score
    Score.find({}).then(function(scores){
      socket.emit("score:printScore", scores);
    })

    socket.on('message:newMessage', function (msg){
        messages.push(pseudo + ":" + msg);
        io.emit("message:printMessage", msg, pseudo);
    });

    socket.on('disconnect', function(){
      io.emit("connexion:disconnect", pseudo);
      User.findOneAndRemove({username: pseudo}, function(err){
        if(err){
          throw err;
        }
      });
      console.log('user disconnected');
    });

    socket.on("score:majScore",function(objScore){
      //Enregistrer score database
      Score.findOne({}, function(err, score) {
            if(err)
                throw err;
            if(score){
               //update
              Score.update({}, {score1: objScore.score1, score2: objScore.score2}, function(err,doc){
                if (err) {
                  console.log(err);
                }else{
                  console.log("score modifié");
                }
              });
            }else{
              //ajouter
              console.log("ajouter")
              let score = new Score();
              score.score1 = objScore.score1;
              score.score2 = objScore.score2;
              score.save(function(err){
                if (err)
                  console.log(err);
              });
            }
      });
      io.emit("score:printScore", [objScore]);
    });

    socket.on("comment:newComment",function(comment){
      // comments.unshift({text:comment.text, equipe:comment.equipe, type:comment.type, minute: comment.minute});
      let commentSave = new Comment();
      commentSave.text = comment.text;
      commentSave.equipe = comment.equipe;
      commentSave.type = comment.type;
      commentSave.minute = comment.minute;
      commentSave.save(function(err){
          if(err){
              console.log(err);
              return;
          }else{
              console.log("OK");
          }
      });
      //Enregistrer commentaire database
      io.emit("comments:printComment", comment);
    });

    socket.on("team:majTeam",function(objEquipe){
      //Enregistrer les équipes database
      Equipe.findOne({}, function(err, equipe) {
            var equipeSave = {};
            if(err)
                throw err;
            if(equipe){
               //update
              equipeSave=equipe;
              Equipe.update({}, {equipe1: {nom : objEquipe.equipe1}, equipe2: {nom : objEquipe.equipe2}}, function(err,doc){
                if (err) {
                  console.log(err);
                }else{
                  console.log("Equipe modifié");
                }
              });
            }else{
              //ajouter
              console.log("ajout équipe")
              let equipe = new Equipe();
              equipe.equipe1.nom = objEquipe.equipe1;
              equipe.equipe2.nom = objEquipe.equipe2;
              equipeSave = equipe
              equipe.save(function(err){
                if (err)
                  console.log(err);
              });
            }
            io.emit("equipe:printEquipe", [equipeSave]);
      });
    });

});

