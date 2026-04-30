// Usuario.js — Entidade que mapeia a coleção 'usuarios' no MongoDB
// Representa o dono da agenda. Inclui busca por email além do CRUD padrão.

import Database from '../config/Database.js';
import Logger from '../utils/Logger.js';

class Usuario {
  /**
   * @param {object} dados
   * @param {string} dados.nome          - Nome completo do usuário. Obrigatório.
   * @param {string} dados.email         - Email único do usuário. Obrigatório.
   * @param {string} [dados.fuso_horario] - Fuso padrão IANA. Default: "America/Sao_Paulo".
   */
  constructor({ nome, email, fuso_horario = 'America/Sao_Paulo' }) {
    this.nome = nome;
    this.email = email;
    this.fuso_horario = fuso_horario;
    this.criadoEm = new Date();
  }

  // Regex de validação de email — cobre o formato padrão addr@dominio.tld
  static #REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  #validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new TypeError('Validação falhou: o campo "nome" é obrigatório.');
    }
    if (!this.email || !Usuario.#REGEX_EMAIL.test(this.email)) {
      throw new TypeError(
        'Validação falhou: o campo "email" é obrigatório e deve ter um formato válido.'
      );
    }
  }

  /**
   * Insere o usuário na coleção 'usuarios'.
   * Verifica duplicidade de email antes de inserir para manter a unicidade.
   * @returns {Promise<string>} O _id gerado pelo MongoDB.
   */
  async salvar() {
    this.#validar();

    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('usuarios');

      // Guarda de duplicidade: email deve ser único na agenda
      const existente = await colecao.findOne({ email: this.email });
      if (existente) {
        throw new Error(
          `Conflito: já existe um usuário cadastrado com o email "${this.email}".`
        );
      }

      const documento = {
        nome: this.nome.trim(),
        email: this.email.toLowerCase().trim(),
        fuso_horario: this.fuso_horario,
        criadoEm: this.criadoEm,
      };

      const resultado = await colecao.insertOne(documento);
      console.log(`[Usuario] ✅ Usuário "${this.nome}" salvo com _id: ${resultado.insertedId}`);
      return resultado.insertedId.toString();

    } catch (erro) {
      Logger.registrar(erro, 'Usuario.salvar');
      throw erro;
    }
  }

  /**
   * Busca um usuário pelo endereço de email.
   * A busca é case-insensitive pois o email é armazenado em lowercase.
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  static async buscarPorEmail(email) {
    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('usuarios');

      const usuario = await colecao.findOne({ email: email.toLowerCase().trim() });

      if (!usuario) {
        console.warn(`[Usuario] ⚠️  Nenhum usuário encontrado com email: ${email}`);
      }

      return usuario;

    } catch (erro) {
      Logger.registrar(erro, 'Usuario.buscarPorEmail');
      throw erro;
    }
  }
}

export default Usuario;