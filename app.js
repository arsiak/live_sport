var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('cookie-session')
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(session({
  secret: 'keyboard cat',
}))

app.use(function(req,res,next){
    if(typeof(req.session.todoList) == 'undefined'){
       req.session.todoList = [];
    }
    next();
});

// app.use(bodyParser());

app.get('/', function(req,res){
    res.setHeader('Content-Type','text/html');
    res.render('index.ejs', {todoList : req.session.todoList});
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

app.listen(8080);