const { MongoClient } = require('mongodb');

// Substitua o texto abaixo pela sua string real com a senha
const connectionString = "mongodb+srv://igordmouragomes_db_user:o4Dk1UVRomORdWnQ@cluster0.eepmjtz.mongodb.net/?appName=Cluster0"
const client = new MongoClient(connectionString);

async function testarConexao() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB Atlas com sucesso!");
    } catch (erro) {
        console.log("Erro ao conectar:", erro);
    } finally {
        await client.close();
    }
}

testarConexao();