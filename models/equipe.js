var equipes = {equipe1 :{nom : "test", couleur : "blue"}, equipe2 : {nom : "test", couleur : "rouge"}}

let mongoose = require('mongoose');

// Customers schema
let equipeSchema = mongoose.Schema({
    equipe1 : {
        nom : {
            type : String,
        },
        couleur : {
            type : String,
        },
    },
    equipe2 : {
        nom : {
            type : String,
        },
        couleur : {
            type : String,
        },
    },
});

let Equipe = module.exports = mongoose.model('Equipe', equipeSchema);