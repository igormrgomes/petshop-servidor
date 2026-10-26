# Instruções para o Copilot — petshop-servidor

## Sobre o projeto
Backend do PetShop Patas & Pelos, um projeto de curso. Node.js + Express + MongoDB Atlas (driver oficial `mongodb`), em um único arquivo `servidor.js`. Publicado no Render. O frontend é um projeto separado (`petshop`).

## Idioma
Responda, comente e nomeie variáveis em português do Brasil. Nomes de campos existentes não devem ser traduzidos nem alterados.

## Coleções e campos existentes (use exatamente estes nomes)
- `pets`: `nome_pet`, `especie_pet`, `raca_pet`, `dono_pet`, `telefone_dono`, `cep_dono`, `rua_dono`, `bairro_dono`, `cidade_dono`, `uf_dono`
- `agendamentos`: `pet_id` (texto com o _id do pet), `servico`, `data` (AAAA-MM-DD), `hora` (HH:MM), `observacoes`

## Padrões do código
- Rotas com `app.get/post/put/delete`, funções `async`, `req.params`, `req.query`, `req.body`.
- `_id` sempre convertido com `new ObjectId(id)` para buscar; `.toString()` para comparar.
- Validação com `return res.status(400).json({ mensagem })`; não encontrado com 404; criação com 201.
- Rotas fixas (ex.: `/pets/total`) antes das rotas com `:id`.
- Sem bibliotecas novas sem me perguntar antes.
- Autenticação com bcrypt + jsonwebtoken; token no cabeçalho Authorization: Bearer; 401 para não autenticado

## Proibido
- Ler, citar ou alterar o arquivo `.env`.
- Apagar ou reescrever rotas que não fazem parte da tarefa pedida.
- Mudar a estrutura de pastas.
- Guardar senhas sem hash bcrypt; colocar segredos (JWT) fora do .env; criar tokens sem expiração; devolver senha ou hash em respostas

## Como testo
`node servidor.js` local; rotas testadas pelo navegador ou pelo Console em http://localhost:3000.