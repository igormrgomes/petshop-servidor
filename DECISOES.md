Rotas de leitura (GET /pets e GET /agendamentos) permanecem públicas; todas as rotas de criação, edição e exclusão (POST, PUT e DELETE) ficam protegidas.

POST /login permanece pública para autenticação e emite um JWT com validade de 8 horas, assinado usando somente process.env.JWT_SEGREDO.