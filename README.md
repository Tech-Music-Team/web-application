# Tech Music
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/AlexandreDonisete/web-aplication/blob/main/LICENSE)

# Sobre o projeto

**Tech Music** é uma aplicação web full-stack desenvolvida como projeto acadêmico do 2º semestre do curso de **Análise e Desenvolvimento de Sistemas** da **São Paulo Tech School (SPTECH)**.

A plataforma permite que usuários explorem dados de artistas e músicas, analisem métricas de popularidade, comparem perfis musicais (incluindo features de áudio do Spotify como *danceability*, *energy*, *valence* etc.) e organizem suas próprias **lineups de eventos** e **playlists pessoais**.

A aplicação foi construída do zero seguindo o padrão arquitetural **MVC** (Model-View-Controller), com backend em **Node.js + Express** e banco de dados **MySQL**, integrando-se à **API do Spotify** para enriquecer os dados com imagens dos artistas.

## Funcionalidades principais

- **Autenticação:** cadastro, login e perfil de usuário (edição de nome, alteração de senha, exclusão de conta)
- **Ranking de artistas:** ordenação por popularidade, seguidores, views, likes — com paginação
- **Análise individual de artista:** métricas detalhadas e gráfico radar de features de áudio
- **Comparação de artistas e músicas:** lado a lado, com gráficos comparativos
- **Lista de músicas:** ranking por streams, views, likes e popularidade
- **Lineups (eventos):** CRUD completo — criar, editar, adicionar artistas, deletar
- **Playlists (setlists):** CRUD completo — criar, editar, adicionar músicas, deletar
- **Integração com Spotify API:** busca de imagens de artistas com cache em 3 camadas (token, backend, sessionStorage)
- **Notificações por e-mail:** opção de receber notificações em e-mail secundário

## Dashboards (11 páginas)

| Dashboard | Descrição |
|---|---|
| `rankingartistas.html` | Ranking geral de artistas com filtros |
| `analisarartista.html` | Análise detalhada de um artista |
| `compararartistas.html` | Comparação entre 2 artistas |
| `listamusicas.html` | Lista/ranking de músicas |
| `analisarMusica.html` | Análise detalhada de uma música |
| `compararmusicas.html` | Comparação entre 2 músicas |
| `minhasLineups.html` | Gerenciar lineups do usuário |
| `detalhesLineup.html` | Detalhes de uma lineup específica |
| `minhaPlaylist.html` | Gerenciar playlists do usuário |
| `detalhesPlaylist.html` | Detalhes de uma playlist específica |
| `perfilUsuario.html` | Perfil e configurações do usuário |

## Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                   NAVEGADOR DO USUÁRIO               │
│  HTML + CSS (visual)   JavaScript (lógica da página) │
└─────────────────────────┬────────────────────────────┘
                          │ HTTP Request (fetch)
                          ↓
┌──────────────────────────────────────────────────────┐
│                     SERVIDOR (Node.js)               │
│   app.js → Routes → Controllers → Models             │
└─────────────────────────┬────────────────────────────┘
                          │ SQL Query (prepared statements)
                          ↓
┌──────────────────────────────────────────────────────┐
│                  BANCO DE DADOS (MySQL)              │
│   Tabelas: artista, musica, usuario, lineup, setlist │
└──────────────────────────────────────────────────────┘
```

# Tecnologias utilizadas

## Backend
- **Node.js** — Runtime JavaScript no servidor
- **Express.js** — Framework de rotas e middlewares
- **MySQL2** — Driver MySQL com suporte a *prepared statements*
- **dotenv** — Gerenciamento de variáveis de ambiente
- **cors** — Liberação de chamadas cross-origin
- **nodemon** — Auto-reload em desenvolvimento

## Frontend
- **HTML5** + **CSS3** (vanilla, sem framework)
- **JavaScript** (ES6+, vanilla, sem build tools)
- **Chart.js** — Gráficos radar para features de áudio
- **Fetch API** — Comunicação HTTP com o backend
- **sessionStorage** — Sessão do usuário no navegador

## Integrações externas
- **Spotify Web API** — Busca de imagens de artistas (Client Credentials flow)

## Banco de dados
- **MySQL 8** — Banco relacional
- **Modelagem:** `usuario`, `artista`, `musica`, `lineup`, `setlist`, `lineup_artista`, `setlist_musica`, `roles`

# Como executar o projeto

## Pré-requisitos

- **Node.js** 18 ou superior — [nodejs.org](https://nodejs.org/)
- **MySQL** 8 ou superior — [mysql.com](https://www.mysql.com/)
- **npm** (vem junto com o Node.js)
- Credenciais da **Spotify API** (Client ID e Client Secret) — [developer.spotify.com](https://developer.spotify.com/)

## Passos para execução

```bash
# 1. Clonar o repositório
git clone https://github.com/AlexandreDonisete/web-aplication.git

# 2. Acessar a pasta do projeto
cd web-aplication

# 3. Instalar as dependências
npm install

# 4. Criar o banco de dados
#    Abra o MySQL Workbench (ou cliente de sua preferência) e execute:
#    src/database/comandos-DDL.sql        (cria as tabelas)
#    Popular banco de dados através da Aplicação Java

# 5. Configurar as variáveis de ambiente
#    Edite o arquivo .env.dev (desenvolvimento) com seus dados:
#       DB_HOST=localhost
#       DB_DATABASE='tech_music'
#       DB_USER='root'
#       DB_PASSWORD='sua_senha'
#       DB_PORT=3306
#       APP_PORT=3333
#       APP_HOST=localhost
#       SPOTIFY_CLIENT_ID=seu_client_id
#       SPOTIFY_CLIENT_SECRET=seu_client_secret

# 6. Selecionar o ambiente em app.js (linhas 1-2)
#    var ambiente_processo = "desenvolvimento";    // usa .env.dev
#    var ambiente_processo = "producao";           // usa .env

# 7. Iniciar o servidor
npm run dev          # com auto-reload (nodemon)
# ou
npm start            # sem auto-reload

# 8. Acessar no navegador
#    http://localhost:3333
```

## Estrutura de pastas

```
web-aplication/
│
├── app.js                      ← Ponto de entrada do servidor
├── package.json
├── .env / .env.dev             ← Variáveis de ambiente
│
├── src/                        ← Backend
│   ├── database/               ← Conexão MySQL + scripts SQL
│   ├── routes/                 ← Definição das rotas
│   ├── controllers/            ← Lógica das funcionalidades
│   ├── models/                 ← Consultas ao banco
│   └── services/               ← Serviços externos (Spotify Auth)
│
├── public/                     ← Frontend
│   ├── dashboards/             ← Páginas HTML (11 dashboards)
│   ├── css/                    ← Estilos
│   ├── js/                     ← Scripts das páginas
│   └── assets/                 ← Imagens, fontes

```

# Autor

**Alexandre Donisete Bezerra Filho**
**Breno Abilio**
**Everton Porfirio**
**Giovanna Oliveira**
**Giovanni Angel**
**Jorge Luiz**

> Projeto desenvolvido em conjunto com a equipe **Tech Music Team (TMT)** durante o 2º semestre de Análise e Desenvolvimento de Sistemas na São Paulo Tech School (SPTECH).
