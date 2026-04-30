# 📅 Agenda Eletrônica Pessoal

Este projeto consiste no desenvolvimento de uma **Camada de Acesso a Dados (Data Access Layer - DAL)** para uma Agenda Eletrônica Pessoal. 

Foi desenvolvido como **Projeto 1** para a disciplina de Programação Web Back-End do curso de Engenharia de Computação (UTFPR).

> ⚠️ **Atenção:** Este projeto **NÃO** é uma API Web RESTful. Seguindo rigorosamente as restrições da disciplina, a arquitetura consiste exclusivamente em uma biblioteca de classes (Node.js Vanilla) que se conecta diretamente ao banco de dados, sem o uso de frameworks de servidor (como Express ou NestJS) ou ODMs (como Mongoose).

## 🎯 Domínio e Temática
A modelagem do banco reflete um cenário de uso real para gestão de rotina, contemplando compromissos corporativos, acadêmicos, de saúde e pessoais. 

Para isso, foram criadas **3 coleções** principais no banco de dados:
1. `Usuario`: Representa o dono da agenda.
2. `Categoria`: Etiquetas organizacionais (ex: Faculdade, Trabalho, Esportes).
3. `Evento`: Os compromissos em si, vinculados a um usuário e a uma categoria.

## 🚀 Tecnologias Utilizadas
* **Linguagem:** Node.js (ES Modules)
* **Banco de Dados:** MongoDB
* **Driver:** `mongodb` (Driver nativo, puro)
* **Manipulação de Arquivos:** Módulo nativo `fs` (File System)

## ✅ Critérios de Avaliação Atendidos

Este repositório cumpre estritamente todas as regras do edital da disciplina:

* **[x] Orientação a Objetos:** As coleções do banco foram mapeadas rigorosamente como classes em JavaScript (ex: `Evento.js`, `Categoria.js`).
* **[x] Métodos CRUD Embutidos:** As classes possuem os métodos de Inserção, Busca e Deleção, executando as consultas NoSQL no SGBD.
* **[x] Verificação de Campos Obrigatórios:** Todos os métodos de persistência validam rigorosamente a existência e formatação dos dados (ex: verificar se a cor da categoria está em formato HEX válido) antes de interagir com o banco.
* **[x] Tratamento de Exceções:** Toda interação com o banco de dados está devidamente encapsulada em blocos `try/catch`.
* **[x] Log Físico de Erros:** Erros de validação ou de banco de dados capturados nos blocos `catch` são registrados com timestamp e *stack trace* em um arquivo físico (`logs/erros.log`) usando a classe utilitária `Logger`.

## 📁 Estrutura do Projeto
```text
agenda-dal/
├── src/
│   ├── config/
│   │   └── Database.js       # Conexão Singleton com MongoDB
│   ├── entities/
│   │   ├── Categoria.js      # Classe da entidade Categoria
│   │   ├── Evento.js         # Classe da entidade Evento
│   │   └── Usuario.js        # Classe da entidade Usuario
│   └── utils/
│       └── Logger.js         # Utilitário de gravação de logs (fs)
├── logs/
│   └── erros.log             # Arquivo gerado automaticamente em runtime
├── index.js                  # Ponto de entrada e script de testes
├── package.json
└── README.md
