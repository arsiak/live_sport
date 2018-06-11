var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var passport = require('passport');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ent = require('ent');
var session = require('cookie-session')

app.use(express.static(__dirname + '/public'));

var usernames = [];
var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour
var sessionMiddleware = session({
  secret: 'keyboard cat',
  cookie: { secure: true,
            httpOnly: true,
            expires: expiryDate
          }
});

app.use(sessionMiddleware);

// app.use(function(req,res,next){
//     if(typeof(req.session.todoList) == 'undefined'){
//        req.session.todoList = [];
//     }
//     next();
// });

// app.use(function(req,res,next){
//     if(typeof(req.session.todoList) == 'undefined'){
//        req.session.todoList = [];
//     }
//     next();
// });

app.get('/log', function(req,res){
    res.setHeader('Content-Type','text/html');
    res.render('log.ejs',{ "username": req.session.username, "error": null });
});

app.post("/log", urlencodedParser, function (req, res) {
  var options = { "username": req.body.username, "error": null };
  if (!req.body.username) {
    options.error = "User name is required";
    res.render("log.ejs", options);
  } else if (req.body.username == req.session.username) {
    // User has not changed username, accept it as-is
    res.redirect("/");
  } else if (!req.body.username.match(/^[a-zA-Z0-9\-_]{3,}$/)) {
    options.error = "User name must have at least 3 alphanumeric characters";
    res.render("log.ejs", options);
  } else {
    // Validate if username is free
      if (usernames.indexOf(req.body.username) != -1) {
        err = "User name already used by someone else";
        res.redirect('404.ejs');
        }
      else{
        req.session.username = req.body.username;
        usernames.push(req.body.username);
        res.redirect('/');
      }
    }   
});

app.get('/', function(req,res){
    if (req.session.username) {
        // User is authenticated, let him in
        res.setHeader('Content-Type','text/html');
        res.render('index.ejs',{test:"abc"});
    } else {
        // Otherwise we redirect him to login form
        res.redirect("/log");
    }
});

app.post('/', urlencodedParser, function(req,res){
    res.setHeader('Content-Type','text/html');
    if(req.body.todoTask != ""){
        req.session.todoList.push(req.body.todoTask);
    }
    res.render('index.ejs', {todoList : req.session.todoList});
});

app.get('/supprimer/:indice', function(req,res){
    res.setHeader('Content-Type','text/html');
    req.session.todoList.splice(req.params.indice,1);
    res.redirect('/');
});


server.listen(8080, function(){
    console.log("Listening on port 8080...");
});

io.use(function(socket,next){
    sessionMiddleware(socket.request,socket.request.res,next);
});
// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) {
    socket.pseudo = socket.request.session.username;
    socket.broadcast.emit("connection:prompt", socket.pseudo);

    socket.on('message:newMessage', function (msg){
        io.emit("message:printMessage", ent.encode(msg), socket.pseudo);
    });

    socket.on('connexion:disconnect', function () {
        var pseudo = socket.request.session.username;
        usernames.splice(usernames.indexOf(socket.pseudo),1);
        socket.broadcast.emit("connection:close", socket.pseudo);
    });

    socket.on('disconnect', function(){
        io.emit("connexion:disconnect", socket.pseudo);
    });

});

