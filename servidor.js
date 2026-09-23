const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());


const PORTA = 3000;

app.get('/', function(req, res) {
    res.send('Meu servidor PetShop está funcionando!');
});

app.get('/pets', async function(req, res) {
    // O await espera a busca na nuvem terminar
    const pets = await colecaoPets.find({}).toArray(); 
    // O driver já entrega um array pronto, sem precisar de JSON.parse!
    res.json(pets); 
});



app.get('/pets/total', function(req, res) {
   let textoLido = fs.readFileSync('dados.json', 'utf-8')
   let pets = JSON.parse(textoLido)
   res.json({ total: pets.length });
});



app.post('/pets', async function(req, res) {
    const novoPet = {
        nome: req.body.nome,
        especie: req.body.especie
    };

    const resultado = await colecaoPets.insertOne(novoPet);

    res.json({ mensagem: 'Pet adicionado com sucesso!', id: resultado.insertedId });
});

app.get('/sobre', function(req, res) {
    res.json({
        projeto: "PetShop Patas & Pelos",
        modulo: "Módulo 7 - Backend com Node.js e Express"
    });
});


app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});

const { MongoClient } = require('mongodb');

// Use a SUA connection string que funcionou na Aula 9.1
const connectionString = "mongodb+srv://igordmouragomes_db_user:o4Dk1UVRomORdWnQ@cluster0.eepmjtz.mongodb.net/?appName=Cluster0"; 
const client = new MongoClient(connectionString);

let colecaoPets;

async function conectarBanco() {
    await client.connect();
    const banco = client.db('petshop');
    colecaoPets = banco.collection('pets');
    console.log("Conectado à coleção de pets!");
}

conectarBanco();