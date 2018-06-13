const express = require('express');
const bodyParser = require('body-parser');
const ent = require('ent');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session')


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
var sess = {
  secret : 'keyboard cat',
  resave : false,
  saveUninitialized: true,

}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));
app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/admin', requireLogin, admin);
app.use('/', main);


//SOCKET.IO
server.listen(8080, function(){
    console.log("Listening on port 8080...");
});

// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) {
    socket.broadcast.emit("connection:prompt");

    socket.on('message:newMessage', function (msg){
        io.emit("message:printMessage", ent.encode(msg));
    });

    socket.on('connexion:disconnect', function () {
        usernames.splice(usernames.indexOf(),1);
        socket.broadcast.emit("connection:close");
    });

    socket.on('disconnect', function(){
        io.emit("connexion:disconnect");
    });

});

