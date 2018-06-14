var socket = io.connect('http://localhost:8080');

// while (pseudo == null){
//     var pseudo = prompt('Quel est votre pseudo ?');
//     socket.emit('petit_nouveau', pseudo);
// }

socket.on('connexion:notif', function(sPseudo){
    var listMessage =  document.getElementById("listMessage");
    var para = document.createElement("li");
    var lg = document.createTextNode(sPseudo + " a rejoint le chat !");
    para.appendChild(lg);
    para.style.fontStyle = "italic";
    listMessage.appendChild(para);
});

// Print message when the user send one
socket.on('message:printMessage', function(msg, sPseudo){
    var listMessage = document.getElementById("listMessage");
    var para = document.createElement("li");
    var span = document.createElement("span");
    var pseudo = document.createTextNode(sPseudo);
    span.appendChild(pseudo);
    span.style.color = "#4395FFFF"
    var message = document.createTextNode( " : " + msg);
    para.appendChild(span)
    para.appendChild(message);
    listMessage.appendChild(para);
    //scroll down
    document.querySelector(".panel-body").scrollTo(0,document.querySelector(".panel-body").scrollHeight);
});


socket.on("connexion:disconnect", function(pseudo){
    // Print pseudo disconnect in chat 
    var listMessage = document.getElementById("listMessage");
    var para = document.createElement("li");
    var message = document.createTextNode(pseudo + " à quitté le chat !");
    para.appendChild(message);
    para.style.fontStyle = "italic";
    listMessage.appendChild(para);

    // Remove the user in onglet users 
    var listPseudo = document.getElementById("listUsers");
    var userToRemove = document.getElementsByClassName(pseudo);
    listPseudo.removeChild(userToRemove[0]);
});

//First connexion, print already connected users in Chat
socket.on("connexion:getUsers", function(users){
    document.getElementById("listUsers").innerHTML = "";
    var listPseudo = document.getElementById("listUsers");
    users.forEach(function(pseudo){
        var para = document.createElement("li");
        var pseudo = document.createTextNode(pseudo);
        para.appendChild(pseudo);
        para.className = pseudo.textContent;
        para.style.fontStyle = "italic";
        listPseudo.appendChild(para);
    })
})

//First connexion, print last messages
socket.on('connexion:getMessages', function(messages){
    var listMessage = document.getElementById("listMessage");
    messages.forEach(function(message){
        var para = document.createElement("li");
        var message = document.createTextNode(message);
        para.appendChild(message);
        listMessage.appendChild(para);
    });
})

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

socket.on('score:printScore', function(objScore){
    var scoreEquipe1 = document.getElementById("score1");
    var scoreEquipe2 = document.getElementById("score2");
    scoreEquipe1.innerHTML = " ";
    scoreEquipe2.innerHTML = " ";
    scoreEquipe1.appendChild(document.createTextNode(objScore.score1));
    scoreEquipe2.appendChild(document.createTextNode(objScore.score2));
})

socket.on('equipe:printEquipe', function(equipes){
    var equipe1 = document.getElementById("equipe1");
    var equipe2 = document.getElementById("equipe2");
    equipe1.innerHTML = " ";
    equipe2.innerHTML = " ";
    console.log(equipes);
    equipe1.appendChild(document.createTextNode(equipes.equipe1.nom.toUpperCase()));
    equipe2.appendChild(document.createTextNode(equipes.equipe2.nom.toUpperCase()));
});

socket.on('comments:printComments', function(comments){
    var listComments = document.getElementById("listComments");
    comments.forEach(function(comment){
        var listComments = document.getElementById("listComments");
        var li = document.createElement("li");
        var eMinute = document.createElement("span");
        eMinute.classList.add("badge", "badge-primary", "badge-pill", "pull-left");
        eMinute.appendChild(document.createTextNode(comment.minute));
        var textComment = document.createTextNode(comment.equipe + ':' + comment.text);
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        li.appendChild(eMinute);
        li.appendChild(textComment);
        listComments.appendChild(li);
    });
});

socket.on('comments:printComment', function(comment){
    var listComments = document.getElementById("listComments");
    var li = document.createElement("li");
    var eMinute = document.createElement("span");
    eMinute.classList.add("badge", "badge-primary", "badge-pill", "pull-left");
    eMinute.appendChild(document.createTextNode(comment.minute));
    var textComment = document.createTextNode(comment.equipe + ':' + comment.text);
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    li.appendChild(eMinute);
    li.appendChild(textComment);
    listComments.insertBefore(li, listComments.firstChild);
});