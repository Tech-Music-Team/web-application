# 📖 GUIA: Implementação de Endpoints RESTful - Passo a Passo

**Data:** 21 de Maio de 2026  
**Status:** 🔵 Pronto para Implementação  
**Tempo Estimado:** 6-8 horas

---

## 📋 ÍNDICE

1. [Setup Inicial](#setup-inicial)
2. [Fase 1: Backend - Estrutura](#fase-1-backend-estrutura)
3. [Fase 2: Backend - Implementação](#fase-2-backend-implementação)
4. [Fase 3: Testes](#fase-3-testes)
5. [Fase 4: Frontend](#fase-4-frontend)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Inicial

### Pré-requisitos

✅ Projeto rodando (`npm start`)  
✅ Banco de dados conectado  
✅ Postman ou similar para testar endpoints  
✅ Terminal aberto na pasta raiz

### Arquivos a Modificar

```
✅ MODIFICAR: /src/models/artistaModel.js
✅ MODIFICAR: /src/controllers/artistaController.js
✅ MODIFICAR: /src/routes/artistas.js
✅ MODIFICAR: /public/js/rankingartistas.js
```

**Nota:** Seguindo padrões existentes do projeto: SQL inline nos models, sem arquivos extras de abstração.

---

## 🔧 FASE 2: Backend - Implementação

### Passo 2.1: Modificar `/src/models/artistaModel.js`

Adicionar novos métodos seguindo o padrão: SQL inline, `var`, `database.executar()`.

**Ação:** Abrir arquivo e ADICIONAR os novos métodos (manter o `listar()` existente)

```javascript
var database = require("../database/config");

// Manter a função listar() existente...

function getRanking(sortField, limit) {
    console.log("ACESSEI O ARTISTA MODEL - getRanking():");

    var instrucao = `
        SELECT
            id_artista as id,
            nome,
            artist_genre as genre,
            artist_popularity as popularity,
            views,
            likes
        FROM artista
        ORDER BY ${sortField} DESC
        LIMIT ${limit}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function search(searchTerm) {
    console.log("ACESSEI O ARTISTA MODEL - search():");

    var instrucao = `
        SELECT
            id_artista as id,
            nome,
            artist_genre as genre,
            artist_popularity as popularity
        FROM artista
        WHERE nome LIKE '%${searchTerm}%'
        LIMIT 10
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function getPerfil(artistaId) {
    console.log("ACESSEI O ARTISTA MODEL - getPerfil():");

    var instrucao = `
        SELECT
            id_artista as id,
            nome,
            artist_popularity as popularity,
            views,
            likes,
            artist_followers as followers,
            artist_genre as genre,
            (SELECT COUNT(*) FROM musica WHERE fk_artista = ${artistaId}) as totalMusicas
        FROM artista
        WHERE id_artista = ${artistaId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function getMusicas(artistaId, sortField, limit) {
    console.log("ACESSEI O ARTISTA MODEL - getMusicas():");

    var instrucao = `
        SELECT
            id_musica as id,
            track,
            track_popularity as popularity,
            streams,
            views,
            likes
        FROM musica
        WHERE fk_artista = ${artistaId}
        ORDER BY ${sortField} DESC
        LIMIT ${limit}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function getAudioFeatures(artistaId) {
    console.log("ACESSEI O ARTISTA MODEL - getAudioFeatures():");

    var instrucao = `
        SELECT
            ROUND(AVG(energy), 3) as energy,
            ROUND(AVG(danceability), 3) as danceability,
            ROUND(AVG(valence), 3) as valence,
            ROUND(AVG(loudness), 2) as loudness,
            ROUND(AVG(speechiness), 3) as speechiness,
            ROUND(AVG(instrumentalness), 3) as instrumentalness
        FROM musica
        WHERE fk_artista = ${artistaId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listar,
    getRanking,
    search,
    getPerfil,
    getMusicas,
    getAudioFeatures
};
```

---

### Passo 2.2: Modificar `/src/controllers/artistaController.js`

Adicionar novos controllers seguindo o padrão: `var`, `function(){}` nos `.then()/.catch()`.

**Ação:** Abrir arquivo e ADICIONAR os novos controllers (manter o `listar()` existente)

```javascript
var artistaModel = require("../models/artistaModel");

// Manter a função listar() existente...

function ranking(req, res) {
    var sortField = req.query.sort || 'artist_popularity';
    var limit = parseInt(req.query.limit) || 50;

    var validSorts = ['artist_popularity', 'views', 'likes'];
    if (!validSorts.includes(sortField)) {
        return res.status(400).send("Sort invalido. Use: artist_popularity, views ou likes");
    }

    artistaModel.getRanking(sortField, limit)
        .then(function (resultado) {
            console.log(`Ranking retornado: ${resultado.length} artistas`);
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar ranking! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function search(req, res) {
    var query = req.query.q;

    if (!query || query.trim().length < 2) {
        return res.status(400).send("Termo de busca deve ter +2 caracteres");
    }

    artistaModel.search(query.trim())
        .then(function (resultado) {
            console.log(`Resultados de busca: ${resultado.length}`);
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro na busca! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function perfil(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    artistaModel.getPerfil(id)
        .then(function (resultado) {
            if (!resultado || resultado.length === 0) {
                return res.status(404).send("Artista nao encontrado");
            }
            res.status(200).json(resultado[0]);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar perfil! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function musicas(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    var sort = req.query.sort || 'track_popularity';
    var limit = parseInt(req.query.limit) || 50;

    var validSorts = ['track_popularity', 'streams', 'views', 'likes'];
    if (!validSorts.includes(sort)) {
        return res.status(400).send("Sort invalido. Use: track_popularity, streams, views ou likes");
    }

    artistaModel.getMusicas(id, sort, limit)
        .then(function (resultado) {
            console.log(`Musicas retornadas: ${resultado.length}`);
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar musicas! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function features(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    artistaModel.getAudioFeatures(id)
        .then(function (resultado) {
            if (!resultado || resultado.length === 0) {
                return res.status(404).send("Artista nao encontrado");
            }
            res.status(200).json(resultado[0]);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar features! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listar,
    ranking,
    search,
    perfil,
    musicas,
    features
};
```

---

### Passo 2.3: Modificar `/src/routes/artistas.js`

Adicionar novas rotas

**Ação:** Abrir arquivo e ADICIONAR novas rotas

```javascript
var express = require("express");
var router = express.Router();

var artistaController = require("../controllers/artistaController");
var spotifyController = require("../controllers/spotifyController");

// Rotas existentes
router.get("/listar", function (req, res) {
    artistaController.listar(req, res);
});

router.get("/spotify/imagem/:id", function (req, res) {
    spotifyController.obterImagemArtista(req, res);
});

// NOVAS ROTAS
router.get("/ranking", function (req, res) {
    artistaController.ranking(req, res);
});

router.get("/search", function (req, res) {
    artistaController.search(req, res);
});

router.get("/:id/perfil", function (req, res) {
    artistaController.perfil(req, res);
});

router.get("/:id/musicas", function (req, res) {
    artistaController.musicas(req, res);
});

router.get("/:id/features", function (req, res) {
    artistaController.features(req, res);
});

module.exports = router;
```

**Nota:** Order matters! Rotas mais específicas ANTES de rotas com parâmetros!

---

## 🧪 FASE 3: Testes

### Passo 3.1: Testar Endpoints com cURL

Abra terminal e execute:

```bash
# Teste 1: Ranking
curl http://localhost:3333/artistas/ranking?sort=popularity&limit=5

# Teste 2: Buscar
curl http://localhost:3333/artistas/search?q=Taylor

# Teste 3: Perfil
curl http://localhost:3333/artistas/1/perfil

# Teste 4: Músicas
curl http://localhost:3333/artistas/1/musicas?sort=popularity&limit=5

# Teste 5: Features
curl http://localhost:3333/artistas/1/features
```

**Resultado esperado:** JSON com dados estruturados

---

### Passo 3.2: Verificar Console

No terminal onde `npm start` está rodando, você deve ver:

```
Executando getRanking: SELECT id_artista as id, nome...
Rankings retornados: 5
```

---

## 🎨 FASE 4: Frontend - Adaptar rankingartistas.js

**Ação:** Modificar `rankingartistas.js` para consumir o endpoint `/artistas/ranking`

Seguindo o padrão existente do projeto (fetch direto, sem api.js ou cache.js):

```javascript
// Estado Global
let allArtists = [];
let currentPage = 1;
const itemsPerPage = 50;
let currentSortField = 'artist_popularity';

// Inicializacao
document.addEventListener('DOMContentLoaded', async () => {
  try {
    validarSessao();
    await fetchRanking();
    renderCards(currentPage);
    updatePaginationUI();
    attachEventListeners();
  } catch (error) {
    console.error('Erro durante inicializacao:', error);
  }
});

// Busca ranking do backend (com sort e limit)
async function fetchRanking() {
  try {
    const response = await fetch('http://localhost:3333/artistas/ranking?sort=' + currentSortField + '&limit=' + itemsPerPage);
    if (!response.ok) {
      throw new Error('Erro na API: ' + response.status);
    }
    allArtists = await response.json();
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    document.getElementById('ranking-body').innerHTML =
      '<p style="text-align: center; padding: 40px; color: #999;">Erro ao carregar ranking.</p>';
  }
}

// Renderiza cards (mesmo padrao existente)
function renderCards(pageNumber) {
  const start = (pageNumber - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const artistasPage = allArtists.slice(start, end);

  let html = '';
  artistasPage.forEach((artista, index) => {
    const position = start + index + 1;
    const color = getPlaceholderColor(artista.id);
    const firstGenre = getFirstGenre(artista.genre);
    html += `
      <div class="card">
        <div class="left-content-group">
          <span class="ranking-number">${position}o</span>
          <div style="width: 65px; height: 65px; background-color: ${color}; border-radius: 8px; flex-shrink: 0;"></div>
          <div class="artist-info-header">
            <span class="artist-name">${artista.nome}</span>
            <span class="genre">Genero: ${firstGenre}</span>
          </div>
        </div>
        <ul>
          <li><span class="artist-atribute">Popularidade</span><span class="atribute-value">${artista.popularity}</span></li>
          <li><span class="artist-atribute">Views</span><span class="atribute-value">${formatNumber(artista.views)}</span></li>
          <li><span class="artist-atribute">Likes</span><span class="atribute-value">${formatNumber(artista.likes)}</span></li>
        </ul>
        <div class="right-content-group">
          <button class="details-button" data-artist-id="${artista.id}">Detalhes do artista</button>
        </div>
      </div>
    `;
  });

  document.getElementById('ranking-body').innerHTML = html;
  colorRankingNumbers();
}

// Utilitarias (mesmas do codigo existente)
function formatNumber(value) { /* ... */ }
function getPlaceholderColor(artistId) { /* ... */ }
function getFirstGenre(genreString) { /* ... */ }
function colorRankingNumbers() { /* ... */ }
```

---

## 🧪 Troubleshooting

### Erro: "SQL syntax error"

**Verificar:** A SQL no model esta correta

```bash
# Testar query manualmente no MySQL
mysql> SELECT id_artista as id FROM artista LIMIT 1;
```

### Erro: "Artista não encontrado" (404)

**Normal!** Significa que o ID não existe no BD

```bash
# Verificar IDs disponíveis
mysql> SELECT id_artista FROM artista LIMIT 5;
```

### Frontend: Dados não aparecem

**Verificar:**
1. Abrir DevTools (F12) → Console
2. Procurar erros vermelhos
3. Verificar URL do endpoint
4. Verificar se servidor está rodando

---

## ✅ Checklist de Conclusão

### Backend
- [ ] `artistaModel.js` modificado com metodo getRanking
- [ ] `artistaController.js` modificado com controller ranking
- [ ] `routes/artistas.js` modificado com nova rota
- [ ] `npm start` rodando sem erros
- [ ] Endpoints testados com cURL ✅

### Frontend
- [ ] `rankingartistas.js` adaptado para usar endpoint
- [ ] Página carrega sem erros
- [ ] Sort funciona (re-fetch do backend)
- [ ] Detalhes redireciona corretamente

### Documentação
- [ ] Este guia foi seguido
- [ ] RESUMO_FINAL atualizado

---

**Proximo endpoint:** `/artistas/search` após validar este ✅
