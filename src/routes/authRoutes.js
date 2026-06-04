// authRoutes.js — Rotas públicas de autenticação
// POST /login  — valida email e inicia sessão
// POST /logout — destrói a sessão ativa

import { Router } from 'express';
import Usuario from '../entities/Usuario.js';
import Logger from '../utils/Logger.js';

const router = Router();

// ── POST /login ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email } = req.body;

  // Validação do campo obrigatório antes de qualquer I/O
  if (!email || email.trim() === '') {
    return res.status(400).json({ erro: 'O campo "email" é obrigatório.' });
  }

  try {
    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      // HTTP 404 semântico: o recurso (usuário) não foi encontrado
      return res.status(404).json({ erro: 'Usuário não encontrado para o email informado.' });
    }

    // Persiste os dados do usuário na sessão do servidor
    req.session.usuarioLogado = {
      _id: usuario._id.toString(),
      nome: usuario.nome,
      email: usuario.email,
    };

    return res.status(200).json({
      mensagem: `Bem-vindo, ${usuario.nome}!`,
      usuario: req.session.usuarioLogado,
    });

  } catch (erro) {
    Logger.registrar(erro, 'authRoutes — POST /login');
    return res.status(500).json({ erro: 'Erro interno ao processar o login.' });
  }
});

// ── POST /logout ──────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy((erroDestroySession) => {
    if (erroDestroySession) {
      Logger.registrar(erroDestroySession, 'authRoutes — POST /logout');
      return res.status(500).json({ erro: 'Erro ao encerrar a sessão.' });
    }
    return res.status(200).json({ mensagem: 'Sessão encerrada com sucesso.' });
  });
});

export default router;