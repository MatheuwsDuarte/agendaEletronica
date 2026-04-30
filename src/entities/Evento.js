// Evento.js — Classe da entidade principal da DAL

import { ObjectId } from 'mongodb';
import Database from '../config/Database.js';
import Logger from '../utils/Logger.js';

// Tipos de evento válidos, refletindo as categorias da agenda pessoal.
// Centralizar aqui evita "magic strings" espalhadas pelo código.
const TIPOS_VALIDOS = ['WEG', 'UTFPR', 'Basquete', 'Academia', 'Pessoal'];

class Evento {
  /**
   * Construtor da entidade Evento.
   * Recebe um objeto de dados e mapeia para as propriedades da instância.
   *
   * @param {object} dados
   * @param {string} dados.titulo       - Título do evento (obrigatório)
   * @param {Date|string} dados.data    - Data/hora do evento (obrigatório)
   * @param {string} dados.tipo         - Categoria: 'WEG', 'UTFPR', 'Basquete', etc. (obrigatório)
   * @param {string} [dados.descricao]  - Descrição opcional
   * @param {string} [dados.local]      - Local opcional (ex: 'Jaraguá do Sul', 'UTFPR')
   */
  constructor({ titulo, data, tipo, descricao = '', local = '' }) {
    this.titulo = titulo;
    this.data = data ? new Date(data) : null; // Normaliza para objeto Date
    this.tipo = tipo;
    this.descricao = descricao;
    this.local = local;
    this.criadoEm = new Date(); // Timestamp de criação definido no momento da instanciação
  }

  // ─────────────────────────────────────────────
  // MÉTODO PRIVADO DE VALIDAÇÃO
  // O prefixo '#' torna o método verdadeiramente privado (ES2022+).
  // Não pode ser acessado fora da classe — é uma garantia sintática, não apenas convenção.
  // ─────────────────────────────────────────────

  /**
   * Valida os campos obrigatórios da instância.
   * Lança um TypeError customizado se a validação falhar.
   */
  #validar() {
    if (!this.titulo || this.titulo.trim() === '') {
      throw new TypeError('Validação falhou: o campo "titulo" é obrigatório.');
    }
    if (!this.data || isNaN(this.data.getTime())) {
      throw new TypeError('Validação falhou: o campo "data" é obrigatório e deve ser uma data válida.');
    }
    if (!this.tipo || !TIPOS_VALIDOS.includes(this.tipo)) {
      throw new TypeError(
        `Validação falhou: o campo "tipo" é obrigatório. Valores aceitos: ${TIPOS_VALIDOS.join(', ')}.`
      );
    }
  }

  // MÉTODOS DE BANCO DE DADOS

  /**
   * Insere o evento atual na coleção 'eventos' do MongoDB.
   * Valida os campos antes de qualquer interação com o banco.
   *
   * @returns {Promise<string>} O _id gerado pelo MongoDB para o documento inserido.
   */
  async salvar() {
    //Validação executada ANTES de qualquer chamada ao driver
    this.#validar();

    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('eventos');

      // Monta o documento a ser persistido a partir das propriedades da instância
      const documento = {
        titulo: this.titulo,
        data: this.data,
        tipo: this.tipo,
        descricao: this.descricao,
        local: this.local,
        criadoEm: this.criadoEm,
      };

      const resultado = await colecao.insertOne(documento);
      console.log(`[Evento] ✅ Evento "${this.titulo}" salvo com _id: ${resultado.insertedId}`);
      return resultado.insertedId.toString();

    } catch (erro) {
      //Qualquer exceção do driver ou do banco é registrada em disco
      Logger.registrar(erro, 'Evento.salvar');
      throw erro; // Re-lança para o chamador tratar conforme necessário
    }
  }

  /**
   * Busca um único evento pelo seu _id do MongoDB.
   * Método estático pois não depende de uma instância de Evento existente.
   *
   * @param {string} id - String do ObjectId do MongoDB.
   * @returns {Promise<object|null>} O documento encontrado, ou null se não existir.
   */
  static async buscarPorId(id) {
    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('eventos');

      // ObjectId é o tipo nativo do MongoDB para IDs — a conversão é obrigatória
      const objectId = new ObjectId(id);
      const evento = await colecao.findOne({ _id: objectId });

      if (!evento) {
        console.warn(`[Evento] ⚠️  Nenhum evento encontrado com id: ${id}`);
      }
      return evento;

    } catch (erro) {
      Logger.registrar(erro, 'Evento.buscarPorId');
      throw erro;
    }
  }

  /**
   * Lista todos os eventos da coleção, com suporte a filtros opcionais.
   * Método estático — operação sobre a coleção, não sobre uma instância.
   *
   * @param {object} [filtro={}] - Filtro MongoDB opcional (ex: { tipo: 'WEG' }).
   * @returns {Promise<object[]>} Array de documentos encontrados.
   */
  static async listarTodos(filtro = {}) {
    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('eventos');

      // toArray() materializa o cursor em um array de documentos na memória
      const eventos = await colecao.find(filtro).toArray();
      console.log(`[Evento] 📋 ${eventos.length} evento(s) encontrado(s).`);
      return eventos;

    } catch (erro) {
      Logger.registrar(erro, 'Evento.listarTodos');
      throw erro;
    }
  }

  /**
   * Remove um evento da coleção pelo seu _id.
   * Método estático — operação direta na coleção.
   *
   * @param {string} id - String do ObjectId do MongoDB.
   * @returns {Promise<boolean>} true se deletado, false se não encontrado.
   */
  static async deletarPorId(id) {
    try {
      const db = await Database.obterConexao();
      const colecao = db.collection('eventos');

      const objectId = new ObjectId(id);
      const resultado = await colecao.deleteOne({ _id: objectId });

      if (resultado.deletedCount === 0) {
        console.warn(`[Evento] ⚠️  Nenhum evento deletado. Id não encontrado: ${id}`);
        return false;
      }

      console.log(`[Evento] 🗑️  Evento com id ${id} deletado com sucesso.`);
      return true;

    } catch (erro) {
      Logger.registrar(erro, 'Evento.deletarPorId');
      throw erro;
    }
  }
}

export default Evento;