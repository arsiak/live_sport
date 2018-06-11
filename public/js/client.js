var socket = io.connect('http://localhost:8080');

// while (pseudo == null){
//     var pseudo = prompt('Quel est votre pseudo ?');
//     socket.emit('petit_nouveau', pseudo);
// }

socket.on('connection:prompt', function(sPseudo){
    var listMessage =  document.getElementById("listMessage");
    var para = document.createElement("p");
    var lg = document.createTextNode(sPseudo + " a rejoint le chat !");
    para.appendChild(lg);
    para.style.fontStyle = "italic";
    listMessage.appendChild(para);
});

socket.on('message:printMessage', function(msg, sPseudo){
    var listMessage = document.getElementById("listMessage");
    var para = document.createElement("p");
    var message = document.createTextNode(sPseudo + ":" + msg);
    para.appendChild(message);
    listMessage.appendChild(para);
    //scroll down
    document.querySelector(".panel-body").scrollTo(0,document.querySelector(".panel-body").scrollHeight);
});

socket.on("connexion:disconnect", function(pseudo){
    var listMessage = document.getElementById("listMessage");
    var para = document.createElement("p");
    var message = document.createTextNode(pseudo + " à quitté le chat !");
    para.appendChild(message);
    listMessage.appendChild(para);
});

function processForm() {
    var msg = document.querySelector('input[name="message"]').value;
    socket.emit('message:newMessage', msg);
};

//Envoyer un message
var formMessage = document.getElementById('messageForm');
formMessage.addEventListener("submit", function(e){
    e.preventDefault();
    processForm();
});