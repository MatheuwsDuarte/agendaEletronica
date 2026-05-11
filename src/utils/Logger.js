// Logger.js — Utilitário de log físico em disco

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Necessário para resolver __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho absoluto para o arquivo de log, criado na pasta /logs na raiz do projeto
const LOG_PATH = path.resolve(__dirname, '../../logs/erros.log');

fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

class Logger {
  /**
   * Grava uma entrada de erro no arquivo físico erros.log.
   * Utiliza fs.appendFileSync para garantir que cada erro seja adicionado
   * sem sobrescrever registros anteriores (acumulativo).
   *
   * @param {Error|string} erro - O objeto de erro capturado no catch, ou uma string descritiva.
   * @param {string} contexto - Identifica qual classe/método originou o erro (ex: 'Evento.salvar').
   */
  static registrar(erro, contexto = 'Desconhecido') {
    const timestamp = new Date().toISOString(); // Ex: 2025-07-10T14:32:05.123Z

    // Extrai a stack trace se for um objeto Error; caso contrário, usa a mensagem diretamente
    const mensagemErro = erro instanceof Error
      ? `${erro.message}\nStack: ${erro.stack}`
      : String(erro);

    const entrada = `[${timestamp}] [ERRO] [Contexto: ${contexto}]\n${mensagemErro}\n${'─'.repeat(60)}\n`;

    try {
      // appendFileSync é síncrono e ideal para logs de erro — garante que a escrita
      // acontece imediatamente, sem perda de dados em caso de crash.
      // O flag 'a' (append) abre o arquivo para escrita sem truncar o conteúdo existente.
      fs.appendFileSync(LOG_PATH, entrada, 'utf8');
    } catch (erroDeEscrita) {
      // Fallback: se não conseguir escrever no disco (ex: permissão negada),
      // ao menos loga no console para não perder o erro silenciosamente.
      console.error('[Logger] FALHA CRÍTICA: Não foi possível escrever no arquivo de log.', erroDeEscrita);
    }
  }
}

export default Logger;