var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var passport = require('passport');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ent = require('ent');

app.use(express.static(__dirname + '/public'));

// app.use(function(req,res,next){
//     if(typeof(req.session.todoList) == 'undefined'){
//        req.session.todoList = [];
//     }
//     next();
// });

app.get('/', function(req,res){
    res.setHeader('Content-Type','text/html');
    res.render('index.ejs',{test:"abc"});
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

// Quand un client se connecte, on le note dans la console
io.on('connection', function (socket) {
    socket.on('connection:firstConnexion', function(pseudo) {
        // console.log(pseudo);
        // socket.pseudo = ent.encode(pseudo);
        socket.broadcast.emit("connection:prompt", pseudo);
    });

     // Quand le serveur reçoit un signal de type "message" du client    
    socket.on('message', function (message) {
        console.log('Un client me parle ! Il me dit : ' + message);
    }); 

    socket.on('sendMessage', function (msg){
        io.emit("newMessage", ent.encode(msg), socket.pseudo);
    });
});
