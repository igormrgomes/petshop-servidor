let colecaoAgendamentos;
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
app.use(express.json());
app.use(cors());


const PORTA = 3000;

// Use a SUA connection string que funcionou na Aula 9.1
const connectionString = process.env.MONGODB_URI; 
const client = new MongoClient(connectionString);

let colecaoPets;
let colecaoUsuarios;

async function conectarBanco() {
    await client.connect();
    const banco = client.db('petshop');
    colecaoPets = banco.collection('pets');
    colecaoAgendamentos = banco.collection('agendamentos');
    colecaoUsuarios = banco.collection('usuarios');
    console.log("Conectado às coleções de pets e agendamentos!");
}

app.get('/', function(req, res) {
    res.send('Meu servidor PetShop está funcionando!');
});

app.get('/pets', async function(req, res) {
    // O await espera a busca na nuvem terminar
    const pets = await colecaoPets.find({}).toArray(); 
    // O driver já entrega um array pronto, sem precisar de JSON.parse!
    const agendamentos = await colecaoAgendamentos.find({}).toArray();

    for (let i = 0; i < pets.length; i++) {
        pets[i].total_agendamentos = agendamentos.filter(function(agendamento) {
            return agendamento.pet_id &&
                agendamento.pet_id.toString() === pets[i]._id.toString();
        }).length;
    }

    res.json(pets); 
});



app.get('/pets/total', function(req, res) {
   let textoLido = fs.readFileSync('dados.json', 'utf-8')
   let pets = JSON.parse(textoLido)
   res.json({ total: pets.length });
});



app.post('/pets', async function(req, res) {
    const novoPet = req.body;

    if (!novoPet.nome_pet || novoPet.nome_pet.trim() === '') {
        return res.status(400).json({ mensagem: 'O nome do pet é obrigatório.' });
    }

    const resultado = await colecaoPets.insertOne(novoPet);
    res.status(201).json({ mensagem: 'Pet adicionado com sucesso!', id: resultado.insertedId });
});

app.post('/login', async function(req, res) {
    if (!process.env.JWT_SEGREDO) {
        console.error('JWT_SEGREDO não está configurado.');
        return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
    }

    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || email.trim() === '' ||
        typeof senha !== 'string' || senha === '') {
        return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await colecaoUsuarios.findOne({ email: emailNormalizado });
    if (usuario === null || typeof usuario.senha_hash !== 'string' ||
        !await bcrypt.compare(senha, usuario.senha_hash)) {
        return res.status(401).json({ mensagem: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
        { sub: usuario._id.toString() },
        process.env.JWT_SEGREDO,
        { expiresIn: '8h' }
    );

    res.json({
        token,
        usuario: {
            id: usuario._id.toString(),
            email: usuario.email
        }
    });
});

app.post('/usuarios', async function(req, res) {
    const { email, senha } = req.body || {};

    if (typeof email !== 'string' || email.trim() === '' ||
        typeof senha !== 'string' || senha.length < 8) {
        return res.status(400).json({
            mensagem: 'Informe um email válido e uma senha com no mínimo 8 caracteres.'
        });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const formatoEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);
    if (!formatoEmailValido) {
        return res.status(400).json({ mensagem: 'Informe um email válido.' });
    }

    const usuarioExistente = await colecaoUsuarios.findOne({ email: emailNormalizado });
    if (usuarioExistente !== null) {
        return res.status(400).json({ mensagem: 'Este email já está cadastrado.' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);
    const resultado = await colecaoUsuarios.insertOne({
        email: emailNormalizado,
        senha_hash: senha_hash
    });

    res.status(201).json({
        mensagem: 'Usuário criado com sucesso!',
        id: resultado.insertedId.toString()
    });
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

    const agendamento = await colecaoAgendamentos.findOne({ pet_id: id });
    if (agendamento !== null) {
        return res.status(400).json({
            mensagem: 'Este pet tem agendamentos. Exclua os agendamentos antes.'
        });
    }

    const resultado = await colecaoPets.deleteOne({ _id: new ObjectId(id) });
    if (resultado.deletedCount === 0) {
    return res.status(404).json({ mensagem: 'Pet não encontrado.' });
}

    res.json({ mensagem: 'Pet excluído!', apagados: resultado.deletedCount });
});

app.get('/versao', function(req, res) {
    res.json({ versao: '1.0' });
});


app.get('/pets/:id', async function(req, res) {
    const id = req.params.id;
    const pet = await colecaoPets.findOne({ _id: new ObjectId(id) });
    if (pet === null) {
    return res.status(404).json({ mensagem: 'Pet não encontrado.' });
}
    res.json(pet);
});

app.put('/pets/:id', async function(req, res) {
    const id = req.params.id;
    const dadosNovos = req.body;

    const resultado = await colecaoPets.updateOne(
        { _id: new ObjectId(id) },
        { $set: dadosNovos }
    );

    if (resultado.matchedCount === 0) {
    return res.status(404).json({ mensagem: 'Pet não encontrado.' });
}

    res.json({ mensagem: 'Pet atualizado!', alterados: resultado.modifiedCount });
});



app.post('/agendamentos', async function(req, res) {
    const novo = req.body;

    if (!novo.pet_id || !novo.servico || !novo.data || !novo.hora) {
        return res.status(400).json({ mensagem: 'Pet, serviço, data e hora são obrigatórios.' });
    }

    const resultado = await colecaoAgendamentos.insertOne(novo);
    res.status(201).json({ mensagem: 'Agendamento criado!', id: resultado.insertedId });
});

app.get('/agendamentos', async function(req, res) {
    const filtro = {};

    if (req.query.data) {
        filtro.data = req.query.data;
    }

    const agendamentos = await colecaoAgendamentos.find(filtro).sort({ data: 1, hora: 1 }).toArray();
    const pets = await colecaoPets.find({}).toArray();

    for (let i = 0; i < agendamentos.length; i++) {
        agendamentos[i].nome_pet = 'Pet não encontrado';
        for (let j = 0; j < pets.length; j++) {
            if (pets[j]._id.toString() === agendamentos[i].pet_id) {
                agendamentos[i].nome_pet = pets[j].nome_pet;
            }
        }
    }

    res.json(agendamentos);
});

app.delete('/agendamentos/:id', async function(req, res) {
    const id = req.params.id;
    const resultado = await colecaoAgendamentos.deleteOne({ _id: new ObjectId(id) });

    if (resultado.deletedCount === 0) {
        return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
    }

    res.json({ mensagem: 'Agendamento excluído!' });
});

app.get('/agendamentos/:id', async function(req, res) {
    const id = req.params.id;
    const agendamento = await colecaoAgendamentos.findOne({ _id: new ObjectId(id) });

    if (agendamento === null) {
        return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
    }

    res.json(agendamento);
});

app.put('/agendamentos/:id', async function(req, res) {
    const id = req.params.id;
    const dadosNovos = req.body;

    if (!dadosNovos.pet_id || !dadosNovos.servico || !dadosNovos.data || !dadosNovos.hora) {
        return res.status(400).json({ mensagem: 'Pet, serviço, data e hora são obrigatórios.' });
    }

    const resultado = await colecaoAgendamentos.updateOne(
        { _id: new ObjectId(id) },
        { $set: dadosNovos }
    );

    if (resultado.matchedCount === 0) {
        return res.status(404).json({ mensagem: 'Agendamento não encontrado.' });
    }

    res.json({ mensagem: 'Agendamento atualizado!' });
});