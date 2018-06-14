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

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session);
app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/admin', requireLogin, admin);
app.use('/', main);

var users = [];
var messages = [];
var score = {score1 : 0, score2 : 0};
var equipes = {equipe1 :{nom : "test", couleur : "blue"}, equipe2 : {nom : "test", couleur : "rouge"}}
var comments = [{text : "ndnfinezafif", equipe : "equipe1", type : "info", minute : "32:00" }];
//SOCKET.IO
server.listen(8080, function(){
    console.log("Listening on port 8080...");
});
io.use(sharedsession(session));
// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) {
    var pseudo = socket.handshake.session.user;
    socket.handshake.session.destroy();
    users.push(pseudo);
    socket.broadcast.emit("connexion:notif", pseudo);
    io.emit("connexion:getUsers", users);
    socket.emit("connexion:getMessages", messages);

    //récupérer les commentaires
    socket.emit("comments:printComments", comments);
    socket.emit("equipe:printEquipe", equipes);
    socket.emit("score:printScore", score);

    socket.on('message:newMessage', function (msg){
        messages.push(pseudo + ":" + msg);
        io.emit("message:printMessage", ent.encode(msg), pseudo);
    });

    socket.on('disconnect', function(){
      io.emit("connexion:disconnect", pseudo);
      var index = users.indexOf(pseudo);
      users.splice(index,1);
      console.log('user disconnected');
    });

    socket.on("score:majScore",function(objScore){
      //Enregistrer score database
      score.score1 = objScore.score1;
      score.score2 = objScore.score2;
      io.emit("score:printScore", objScore);
    });

    socket.on("comment:newComment",function(comment){
      comments.unshift({text:comment.text, equipe:comment.equipe, type:comment.type, minute: comment.minute});
      //Enregistrer commentaire database
      io.emit("comments:printComment", comment);
    });

    socket.on("team:majTeam",function(objEquipe){
      equipes.equipe1.nom = objEquipe.equipe1;
      equipes.equipe2.nom = objEquipe.equipe2;
      //Enregistrer team dans la database
      io.emit("equipe:printEquipe", equipes);
    });

});

