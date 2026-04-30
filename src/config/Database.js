// Database.js — Gerenciador de conexão com o MongoDB
// Padrão Singleton: garante que apenas UMA instância do cliente seja criada
// Reutilizada por todas as classes da DAL durante o ciclo de vida da aplicação.

import { MongoClient } from 'mongodb';
import Logger from '../utils/Logger.js';

// String de conexão padrão para ambiente de desenvolvimento local.
// Em produção, isso viria de uma variável de ambiente (process.env.MONGO_URI).
const MONGO_URI = 'mongodb://localhost:27017';
const NOME_BANCO = 'agenda_pessoal';

class Database {
  // A instância única do MongoClient é mantida como propriedade estática da classe.
  // Propriedades estáticas pertencem à classe, não aos objetos — é exatamente
  // o que o padrão Singleton exige.
  static #clienteInstancia = null;
  static #dbInstancia = null;

  /**
   * Retorna a instância única do objeto Db do driver nativo do MongoDB.
   * Se a conexão já existir, reutiliza. Caso contrário, cria uma nova.
   * Cumpre o Requisito R4 (try/catch) e R5 (Logger em caso de falha).
   *
   * @returns {Promise<Db>} O objeto de banco de dados do driver nativo.
   */
  static async obterConexao() {
    // Se já existe uma instância de Db, retorna diretamente (núcleo do Singleton)
    if (Database.#dbInstancia) {
      return Database.#dbInstancia;
    }

    try {
      Database.#clienteInstancia = new MongoClient(MONGO_URI);

      // connect() abre o pool de conexões TCP com o servidor MongoDB
      await Database.#clienteInstancia.connect();

      // db() retorna um objeto Db que aponta para o banco especificado.
      // O MongoDB cria o banco automaticamente na primeira inserção de dados.
      Database.#dbInstancia = Database.#clienteInstancia.db(NOME_BANCO);

      console.log(`[Database] ✅ Conexão estabelecida com sucesso. Banco: "${NOME_BANCO}"`);
      return Database.#dbInstancia;

    } catch (erro) {
      // falha de conexão é um erro crítico e deve ser logado em disco
      Logger.registrar(erro, 'Database.obterConexao');
      // Re-lança o erro para que o chamador saiba que a conexão falhou
      throw new Error(`[Database] Falha ao conectar ao MongoDB: ${erro.message}`);
    }
  }

  /**
   * Encerra a conexão com o MongoDB de forma limpa.
   * Deve ser chamado ao final do script para liberar recursos.
   */
  static async fecharConexao() {
    if (Database.#clienteInstancia) {
      await Database.#clienteInstancia.close();
      Database.#clienteInstancia = null;
      Database.#dbInstancia = null;
      console.log('[Database] 🔌 Conexão encerrada.');
    }
  }
}

export default Database;