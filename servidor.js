const cors = require('cors');
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
app.use(express.json());
app.use(cors());


const PORTA = 3000;

// Use a SUA connection string que funcionou na Aula 9.1
const connectionString = process.env.MONGODB_URI; 
const client = new MongoClient(connectionString);

let colecaoPets;

async function conectarBanco() {
    await client.connect();
    const banco = client.db('petshop');
    colecaoPets = banco.collection('pets');
    console.log("Conectado à coleção de pets!");
}

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
    const novoPet = req.body;
    const resultado = await colecaoPets.insertOne(novoPet);
    res.json({ mensagem: 'Pet adicionado com sucesso!', id: resultado.insertedId });
});

app.get('/sobre', function(req, res) {
    res.json({
        projeto: "PetShop Patas & Pelos",
        modulo: "Módulo 7 - Backend com Node.js e Express"
    });
});

conectarBanco();
app.listen(PORTA, function() {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});



app.delete('/pets/:id', async function(req, res) {
    const id = req.params.id;

    const resultado = await colecaoPets.deleteOne({ _id: new ObjectId(id) });

    res.json({ mensagem: 'Pet excluído!', apagados: resultado.deletedCount });
});

app.get('/versao', function(req, res) {
    res.json({ versao: '1.0' });
});


app.get('/pets/:id', async function(req, res) {
    const id = req.params.id;
    const pet = await colecaoPets.findOne({ _id: new ObjectId(id) });
    res.json(pet);
});

app.put('/pets/:id', async function(req, res) {
    const id = req.params.id;
    const dadosNovos = req.body;

    const resultado = await colecaoPets.updateOne(
        { _id: new ObjectId(id) },
        { $set: dadosNovos }
    );

    res.json({ mensagem: 'Pet atualizado!', alterados: resultado.modifiedCount });
});
