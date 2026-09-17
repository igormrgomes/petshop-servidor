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

function gerarNovoId(listaDePets) {
    let maiorId = 0;

    for (let i = 0; i < listaDePets.length; i++) {
        if (listaDePets[i].id > maiorId) {
            maiorId = listaDePets[i].id;
        }
    }

    return maiorId + 1;
}

app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

app.post('/pets', function(req, res) {
    // 1. Lê o arquivo dados.json e converte o texto para o array pets
    let textoLido = fs.readFileSync('dados.json', 'utf-8');
    let pets = JSON.parse(textoLido);

    // 2. Pega o pet enviado na requisição e adiciona no array

    let novoId = gerarNovoId(pets);

let novoPet = {
    id: novoId,
    nome: req.body.nome,
    especie: req.body.especie
};
    pets.push(novoPet);

    // 3. Escreve o array atualizado de volta no arquivo dados.json
    fs.writeFileSync('dados.json', JSON.stringify(pets));

    // 4. Envia a resposta de confirmação
    res.json({ mensagem: "Pet adicionado com sucesso!", pet: novoPet });
});

app.get('/sobre', function(req, res) {
    res.json({
        projeto: "PetShop Patas & Pelos",
        modulo: "Módulo 7 - Backend com Node.js e Express"
    });
});


