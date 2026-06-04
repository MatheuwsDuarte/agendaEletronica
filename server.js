// server.js — Ponto de entrada da aplicação Express (Projeto 2)

import express from 'express';
import session from 'express-session';
import Database from './src/config/Database.js';
import Logger from './src/utils/Logger.js';
import authRoutes from './src/routes/authRoutes.js';
import eventoRoutes from './src/routes/eventoRoutes.js';

const app = express();
const PORTA = 3000;

// ── Middlewares globais ───────────────────────────────────────

// Habilita parsing de JSON no body das requisições (POST/PUT)
app.use(express.json());

// Configura o gerenciador de sessões server-side
// resave: false          — não regrava a sessão se ela não foi modificada
// saveUninitialized: false — não cria sessão para requisições sem login (LGPD-friendly)
app.use(session({
  secret: 'agenda_pessoal_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,   // Cookie inacessível via JavaScript no cliente
    maxAge: 1000 * 60 * 60 * 8, // Sessão expira em 8 horas
  },
}));

// ── Registro de rotas ─────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/eventos', eventoRoutes);

// ── Rota de health check (pública) ───────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({ status: 'online', mensagem: 'Agenda Eletrônica API — v2.0' });
});

// ── Inicialização ─────────────────────────────────────────────
async function iniciar() {
  try {
    await Database.obterConexao();
    app.listen(PORTA, () => {
      console.log(`[server] ✅ Servidor rodando em http://localhost:${PORTA}`);
    });

  } catch (erro) {
    Logger.registrar(erro, 'server.js — inicialização');
    console.error('[server] ❌ Falha crítica ao iniciar:', erro.message);
    process.exit(1);
  }
}

iniciar();