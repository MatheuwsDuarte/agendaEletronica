# 📅 Agenda Eletrônica Pessoal (API Web & DAL)

Este projeto consiste no desenvolvimento de uma **Aplicação Web (API)** para uma Agenda Eletrônica Pessoal, construída sobre uma robusta **Camada de Acesso a Dados (DAL)**. 

Foi desenvolvido integrando os requisitos dos **Projetos 1 e 2** para a disciplina de Programação Web Back-End do curso de Engenharia de Computação (UTFPR).

> 🚀 **Evolução do Projeto (Fase 2):** Inicialmente concebido apenas como uma biblioteca de classes pura, o sistema foi evoluído para uma API utilizando **Express.js**. Foram implementadas rotas HTTP que consomem a DAL, com controle de acesso rigoroso utilizando **Sessões** (`express-session`). O retorno dos dados é feito inteiramente no formato **JSON**.

## 🎯 Domínio e Temática
A modelagem reflete um cenário de uso real para gestão de rotina, contemplando compromissos corporativos, acadêmicos, de saúde e pessoais. 

As **3 coleções** principais no banco de dados são:
1. `Usuario`: Representa o dono da agenda (utilizado na validação de login).
2. `Categoria`: Etiquetas organizacionais (ex: Faculdade, Trabalho).
3. `Evento`: Os compromissos em si, vinculados a um usuário.

## 🚀 Tecnologias Utilizadas
* **Linguagem:** Node.js (ES Modules)
* **Framework Web:** Express.js
* **Autenticação:** `express-session` (Sessões server-side com cookies HTTP-Only)
* **Banco de Dados:** MongoDB (Driver nativo `mongodb`, sem ODMs)
* **Manipulação de Arquivos:** Módulo nativo `fs` (File System) para logs.

## ✅ Critérios de Avaliação Atendidos (Projeto 1 e 2)

* **[x] Integração Web-DAL:** As rotas do Express (Controllers) não acessam o banco diretamente; elas instanciam as classes da DAL (Orientação a Objetos) para persistência.
* **[x] Roteamento e Parâmetros (GET/POST):** Implementação de rotas limpas recebendo dados via `req.body`.
* **[x] Autenticação e Sessões:** Uso de Middlewares para bloquear rotas privadas (`/eventos`). Somente requisições com a sessão ativa (`/login`) possuem acesso.
* **[x] Verificação de Campos e Status Semânticos:** Dados obrigatórios são validados nas rotas. Caso falhem, a API retorna HTTP 400 (Bad Request) com mensagens claras em JSON.
* **[x] Tratamento de Exceções e Log Físico:** Blocos `try/catch` blindam as operações. Falhas internas (HTTP 500) disparam o utilitário `Logger`, que grava a stack do erro no arquivo físico `logs/erros.log`.

## 📁 Estrutura do Projeto

```text
agenda-dal/
├── src/
│   ├── config/
│   │   └── Database.js       # Conexão Singleton com MongoDB
│   ├── entities/             # Classes da Camada de Dados (DAL)
│   │   ├── Categoria.js      
│   │   ├── Evento.js         
│   │   └── Usuario.js        
│   ├── middlewares/
│   │   └── authMiddleware.js # Guarda de rotas (Verificação de Sessão)
│   ├── routes/
│   │   ├── authRoutes.js     # Rotas públicas (/login, /logout)
│   │   └── eventoRoutes.js   # Rotas privadas protegidas (/eventos)
│   └── utils/
│       └── Logger.js         # Utilitário de gravação de logs (fs)
├── logs/
│   └── erros.log             # Arquivo de rastreio contínuo gerado em runtime
├── server.js                 # Ponto de entrada (Servidor Express e Sessões)
├── package.json
└── README.md

## 🛠️ Como Executar e Testar a API

### Pré-requisitos
* **Node.js** (v18+) e **MongoDB Community Server** rodando localmente (porta `27017`).
* Cliente REST (Thunder Client no VS Code, Postman ou Insomnia).

### 1. Inicialização

```bash
# Instalar dependências (Express, express-session, mongodb)
npm install

# Iniciar o servidor na porta 3000
npm start

Desenvolvido por Matheus Duarte para a disciplina de Programação Web Back-End.
