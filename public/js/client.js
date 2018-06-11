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
    listMessage.insertBefore(para, listMessage.childNodes[0]);
});

socket.on('newMessage', function(msg, sPseudo){
    var listMessage = document.getElementById("listMessage");
    var para = document.createElement("p");
    var message = document.createTextNode(sPseudo + ":" + msg);
    para.appendChild(message);
    // listMessage.insertBefore(para, listMessage.childNodes[0]);
    listMessage.appendChild(para);
    //scroll down
    document.querySelector(".panel-body").scrollTo(0,document.querySelector(".panel-body").scrollHeight);
});

function processForm() {
    var msg = document.querySelector('input[name="message"]').value;
    socket.emit('sendMessage', msg);
};

//Envoyer un message
var formMessage = document.getElementById('messageForm');
formMessage.addEventListener("submit", function(e){
    e.preventDefault();
    processForm();
});