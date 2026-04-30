// index.js — Script de teste da Sprint 2
// Executar com: node index.js
// Usuário → Categorias → Erro de validação → Evento vinculado

import Database from './src/config/Database.js';
import Evento from './src/entities/Evento.js';
import Logger from './src/utils/Logger.js';
import Categoria from './src/entities/Categoria.js';
import Usuario from './src/entities/Usuario.js';


async function executar() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   AGENDA ELETRONICA — Sprint2: Domínio Completo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

 await Database.obterConexao();

  // ── BLOCO A: Usuário ──────────────────────────────────────────
  console.log('[ A ] Salvando usuário Matheus...');
  let idUsuario;
  try {
    const matheus = new Usuario({
      nome: 'Matheus',
      email: 'matheus@utfpr.edu.br',
    });
    idUsuario = await matheus.salvar();

  } catch (erro) {
    // Se o usuário já existe de uma execução anterior, apenas recuperamos
    if (erro.message.includes('Conflito')) {
      console.warn(`[index.js] ℹ️  ${erro.message} Buscando por email...`);
      const existente = await Usuario.buscarPorEmail('matheus@utfpr.edu.br');
      idUsuario = existente._id.toString();
    } else {
      Logger.registrar(erro, 'index.js — Bloco A');
      throw erro;
    }
  }

  // ── BLOCO B: Categorias válidas ───────────────────────────────
  console.log('\n[ B ] Salvando categorias "Estágio WEG" e "Faculdade"...');
  let idCategoriaWeg;
  try {
    const categoriaWeg = new Categoria({ nome: 'Estágio WEG', cor: '#0057A8' });
    idCategoriaWeg = await categoriaWeg.salvar();

    const categoriaFaculdade = new Categoria({ nome: 'Faculdade', cor: '#FFD700' });
    await categoriaFaculdade.salvar();

  } catch (erro) {
    console.error(`[index.js] ❌ Erro ao salvar categoria: ${erro.message}`);
    Logger.registrar(erro, 'index.js — Bloco B');
  }

  // ── BLOCO C: Forçar erro de validação na Categoria ────────────
  console.log('\n[ C ] Tentando salvar categoria INVÁLIDA (cor fora do padrão hex)...');
  try {
    const categoriaInvalida = new Categoria({
      nome: 'Categoria Quebrada',
      cor: 'azul',           // Inválido: deve ser hex como "#0000FF"
    });
    await categoriaInvalida.salvar();

  } catch (erro) {
    console.error(`[index.js] ❌ Erro capturado como esperado: ${erro.message}`);
    Logger.registrar(erro, 'index.js — Bloco C: Categoria inválida');
    console.log('[index.js] 📝 Erro registrado em logs/erros.log');
  }

  // ── BLOCO D: Evento vinculado à categoria WEG ─────────────────
  console.log('\n[ D ] Salvando evento vinculado à categoria "Estágio WEG"...');
  try {
    const reuniaoOnboarding = new Evento({
      titulo: 'Primeiro dia de empresa — Time de Logistica',
      data: new Date('2026-05-04T07:30:00'),
      tipo: 'WEG',
      descricao: 'Assinar contrato e visitar fabrica.',
      local: 'WEG — Jaraguá do Sul, SC',
      id_categoria: idCategoriaWeg ?? null,
      id_usuario: idUsuario ?? null,
    });
    await reuniaoOnboarding.salvar();

  } catch (erro) {
    console.error(`[index.js] ❌ Erro ao salvar evento: ${erro.message}`);
    Logger.registrar(erro, 'index.js — Bloco D');
  }

  // ── RESUMO FINAL ──────────────────────────────────────────────
  console.log('\n[ RESUMO ] Estado atual das coleções:');

  const categorias = await Categoria.listarTodas();
  console.log('  Categorias:', categorias.map(c => `${c.nome} (${c.cor})`).join(', '));

  const eventos = await Evento.listarTodos();
  console.log('  Eventos:', eventos.map(e => e.titulo).join(', '));

  const usuario = await Usuario.buscarPorEmail('matheus@utfpr.edu.br');
  console.log(`  Usuário ativo: ${usuario?.nome} — fuso: ${usuario?.fuso_horario}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await Database.fecharConexao();
  console.log('Sprint 2 concluída. Banco com 3 coleções ativas.\n');
}

executar().catch((erro) => {
  Logger.registrar(erro, 'index.js — erro fatal não tratado');
  console.error('[FATAL]', erro.message);
  process.exit(1);


});