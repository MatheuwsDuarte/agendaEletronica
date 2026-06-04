// authMiddleware.js — Guarda de rota para sessões autenticadas
// Bloqueia qualquer requisição sem sessão ativa com HTTP 401

const authMiddleware = (req, res, next) => {
  if (!req.session.usuarioLogado) {
    return res.status(401).json({ erro: 'Não autorizado. Faça login para continuar.' });
  }
  next();
};

export default authMiddleware;