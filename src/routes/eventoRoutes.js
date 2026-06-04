// eventoRoutes.js — Rotas privadas para gerenciamento de eventos
// Todas protegidas pelo authMiddleware — exigem sessão ativa
// POST /eventos — cria um novo evento vinculado ao usuário da sessão
// GET  /eventos — lista todos os eventos do banco

import { Router } from 'express';
import Evento from '../entities/Evento.js';
import Logger from '../utils/Logger.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Aplica o middleware em todas as rotas deste router
router.use(authMiddleware);

// ── POST /eventos ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { titulo, data, tipo, descricao, local } = req.body;

  // Validação dos campos obrigatórios na camada de rota,
  // antes de instanciar a classe ou tocar no banco
  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ erro: 'O campo "titulo" é obrigatório.' });
  }
  if (!data) {
    return res.status(400).json({ erro: 'O campo "data" é obrigatório.' });
  }
  if (!tipo || tipo.trim() === '') {
    return res.status(400).json({ erro: 'O campo "tipo" é obrigatório.' });
  }

  try {
    // Instancia a classe da DAL e vincula ao usuário autenticado na sessão
    const evento = new Evento({
      titulo,
      data,
      tipo,
      descricao: descricao ?? '',
      local: local ?? '',
      id_usuario: req.session.usuarioLogado._id,
    });

    const idInserido = await evento.salvar();

    return res.status(201).json({
      mensagem: 'Evento criado com sucesso.',
      id: idInserido,
    });

  } catch (erro) {
    // Erros de validação interna da classe (TypeError do #validar())
    // são retornados como 400 — não são falhas de servidor
    if (erro instanceof TypeError) {
      return res.status(400).json({ erro: erro.message });
    }

    Logger.registrar(erro, 'eventoRoutes — POST /eventos');
    return res.status(500).json({ erro: 'Erro interno ao salvar o evento.' });
  }
});

// ── GET /eventos ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const eventos = await Evento.listarTodos();
    return res.status(200).json(eventos);

  } catch (erro) {
    Logger.registrar(erro, 'eventoRoutes — GET /eventos');
    return res.status(500).json({ erro: 'Erro interno ao buscar os eventos.' });
  }
});

export default router;