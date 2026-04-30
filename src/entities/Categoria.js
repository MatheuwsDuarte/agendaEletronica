// Categoria.js — Entidade que mapeia a coleção 'categorias' no MongoDB
// Padrão idêntico ao Evento.js: validação privada, try/catch em todo I/O, Logger em falhas.

import { ObjectId } from 'mongodb';
import Database from '../config/Database.js';
import Logger from '../utils/Logger.js';

class Categoria {
  /**
   * @param {object} dados
   * @param {string} dados.nome - Nome da categoria (ex: "Estágio WEG"). Obrigatório.
   * @param {string} dados.cor  - Cor em hex para identificação visual (ex: "#FF5733"). Obrigatório.
   */
  constructor({ nome, cor }) {
    this.nome = nome;
    this.cor = cor;
    this.criadoEm = new Date();
  }

  // Regex que valida formato hexadecimal de cor: #FFF ou #FFFFFF
  static #REGEX_COR_HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

  #validar() {
    if (!this.nome || this.nome.trim() === '') {
      throw new TypeError('Validação falhou: o campo "nome" é obrigatório.');
    }
    if (!this.cor || !Categoria.#REGEX_COR_HEX.test(this.cor)) {
      throw new TypeError(
        'Validação falhou: o campo "cor" é obrigatório e deve estar no formato hex (ex: "#FF5733").'
      );
    }
  }

  /**
   * Insere a categoria na coleção 'categorias'.
   * @returns {Promise<string>} O _id gerado pelo MongoDB.
   */
  async salvar() {
    this.#validar();

    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('categorias');

      const documento = {
        nome: this.nome.trim(),
        cor: this.cor,
        criadoEm: this.criadoEm,
      };

      const resultado = await colecao.insertOne(documento);
      console.log(`[Categoria] ✅ Categoria "${this.nome}" salva com _id: ${resultado.insertedId}`);
      return resultado.insertedId.toString();

    } catch (erro) {
      Logger.registrar(erro, 'Categoria.salvar');
      throw erro;
    }
  }

  /**
   * Retorna todas as categorias, ordenadas alfabeticamente por nome.
   * @returns {Promise<object[]>}
   */
  static async listarTodas() {
    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('categorias');

      const categorias = await colecao.find({}).sort({ nome: 1 }).toArray();
      console.log(`[Categoria] 📋 ${categorias.length} categoria(s) encontrada(s).`);
      return categorias;

    } catch (erro) {
      Logger.registrar(erro, 'Categoria.listarTodas');
      throw erro;
    }
  }

  /**
   * Remove uma categoria pelo _id.
   * @param {string} id - String do ObjectId.
   * @returns {Promise<boolean>}
   */
  static async deletar(id) {
    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('categorias');

      const resultado = await colecao.deleteOne({ _id: new ObjectId(id) });

      if (resultado.deletedCount === 0) {
        console.warn(`[Categoria] ⚠️  Nenhuma categoria deletada. Id não encontrado: ${id}`);
        return false;
      }

      console.log(`[Categoria] 🗑️  Categoria com id ${id} deletada com sucesso.`);
      return true;

    } catch (erro) {
      Logger.registrar(erro, 'Categoria.deletar');
      throw erro;
    }
  }
}

export default Categoria;