// index.js — Script de teste da Sprint 1
// Executar com: node index.js
// Simula os 4 cenários: conexão, erro de validação, inserção válida e listagem.

import Database from './src/config/Database.js';
import Evento from './src/entities/Evento.js';
import Logger from './src/utils/Logger.js';

async function executar() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   AGENDA DAL — Sprint 1: Teste de Fundação');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // CENÁRIO 1: Conexão ao banco ───────────────────────────────
  console.log('[ 1/4 ] Conectando ao MongoDB...');
  await Database.obterConexao(); // O Singleton cria a conexão aqui

  // CENÁRIO 2: Forçar erro de validação ───────────────────────
  console.log('\n[ 2/4 ] Tentando salvar evento INVÁLIDO (sem título)...');
  try {
    const eventoInvalido = new Evento({
      titulo: '',       // Campo obrigatório vazio — deve falhar na validação
      data: new Date(),
      tipo: 'WEG',
    });
    await eventoInvalido.salvar(); // Espera-se que lance TypeError aqui

  } catch (erro) {
    // O Logger já foi chamado internamente pelo método #validar via salvar(),
    // O chamador também pode decidir logar contexto adicional.
    console.error(`[index.js] ❌ Erro capturado como esperado: ${erro.message}`);
    // Loga o erro explicitamente a partir do script de entrada (contexto externo)
    Logger.registrar(erro, 'index.js — Cenário 2: Evento inválido');
    console.log('[index.js] 📝 Erro registrado em logs/erros.log');
  }

  // CENÁRIO 3: Inserção de evento válido
  console.log('\n[ 3/4 ] Salvando evento VÁLIDO: "Onboarding WEG"...');
  let idInserido;
  try {
    const onboardingWeg = new Evento({
      titulo: 'Onboarding WEG',
      data: new Date('2026-05-04T07:30:00'),
      tipo: 'WEG',
      descricao: 'Primeiro dia de estágio. Integração com a equipe de Logistica.',
      local: 'WEG — Jaraguá do Sul, SC',
    });
    idInserido = await onboardingWeg.salvar();

    // Inserindo mais um para popular a listagem
    const entregaTcc = new Evento({
      titulo: 'Entrega do TCC 1',
      data: new Date('2026-06-08T23:59:00'),
      tipo: 'UTFPR',
      descricao: 'Envio do TCC 1 para o orientador.',
      local: 'UTFPR — Câmpus CP',
    });
    await entregaTcc.salvar();

  } catch (erro) {
    console.error(`[index.js] ❌ Erro inesperado ao salvar: ${erro.message}`);
  }

  // CENÁRIO 4: Listagem de todos os eventos 
  console.log('\n[ 4/4 ] Listando todos os eventos no banco...');
  try {
    const todos = await Evento.listarTodos();
    todos.forEach((ev, i) => {
      console.log(`  ${i + 1}. [${ev.tipo}] ${ev.titulo} — ${ev.data.toLocaleDateString('pt-BR')}`);
    });
  } catch (erro) {
    console.error(`[index.js] ❌ Erro ao listar: ${erro.message}`);
  }

  // ENCERRAMENTO 
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await Database.fecharConexao();
  console.log('Execução concluída. Verifique logs/erros.log para os registros de erro.\n');
}

// Ponto de entrada — captura erros não tratados no topo do call stack
executar().catch((erro) => {
  Logger.registrar(erro, 'index.js — erro fatal não tratado');
  console.error('[FATAL]', erro.message);
  process.exit(1);
});