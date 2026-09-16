const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());


const PORTA = 3000;

app.get('/', function(req, res) {
    res.send('Meu servidor PetShop está funcionando!');
});

app.get('/pets', function(req, res) {
    let textoLido = fs.readFileSync('dados.json', 'utf-8');
    let pets = JSON.parse(textoLido);
    res.json(pets);
});

app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

app.post('/pets', function(req, res) {
    let novoPet = req.body;
    pets.push(novoPet);
    res.json({ mensagem: "Pet adicionado com sucesso!", pet: novoPet });
});

app.get('/sobre', function(req, res) {
    res.json({
        projeto: "PetShop Patas & Pelos",
        modulo: "Módulo 7 - Backend com Node.js e Express"
    });
});


