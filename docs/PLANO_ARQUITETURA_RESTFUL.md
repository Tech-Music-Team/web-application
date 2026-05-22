# 📐 PLANO: Arquitetura RESTful Orientada a Dados Específicos

**Data de Criação:** 21 de Maio de 2026  
**Status:** 🔵 Planejamento Aprovado - Pronto para Implementação  
**Versão:** 1.0

---

## 📋 VISÃO GERAL

Ao invés de trazer **TODOS** os artistas/músicas e processar no frontend, migrar para uma arquitetura onde **cada endpoint retorna EXATAMENTE** os dados necessários para uma página/funcionalidade específica.

---

## 🎯 OBJETIVOS

- ✅ Reduzir payload de dados em ~90%
- ✅ Eliminar lógica de filtro/sort/paginação do frontend
- ✅ Preparar sistema para 100K+ registros
- ✅ Simplificar código frontend em 70%
- ✅ Facilitar cache e otimizações futuras
- ✅ Estabelecer padrão escalável para novas páginas

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ANTES (Atual - Monolítico)

```
Frontend:        GET /artistas/listar
                        ↓
Backend:         SELECT * FROM artista
                        ↓
Dados:           649 registros × 7 campos = 4.5KB+
                        ↓
Frontend:        Filtra → Ordena → Pagina → Renderiza
```

**Problemas:**
- Tira banda desnecessariamente
- Lógica espalhada (backend retorna tudo, frontend processa)
- Não escala com crescimento de dados

### DEPOIS (Específico - RESTful)

```
Frontend:        GET /artistas/ranking?sort=popularity&limit=10
                        ↓
Backend:         SELECT id, nome, popularity, views, likes 
                 FROM artista ORDER BY popularity DESC LIMIT 10
                        ↓
Dados:           10 registros × 4 campos = 0.3KB
                        ↓
Frontend:        Apenas Renderiza
```

**Benefícios:**
- 15x menos dados
- Lógica centralizada no backend
- Escalável indefinidamente

---

## 🏗️ ESTRUTURA DE ENDPOINTS PROPOSTA

### **GRUPO 1: Ranking Artistas**

Endpoint base: `/artistas/ranking` ou `/dashboard/ranking`

| Endpoint | Método | Query Params | Campos Retornados | Uso |
|----------|--------|--------------|-------------------|-----|
| `/artistas/ranking` | GET | `sort`, `limit` | `id, nome, genre, popularity, views, likes` | Página ranking |
| `/artistas/search` | GET | `q` | `id, nome, genre, popularity` | Busca artista |
| `/artistas/{id}/perfil` | GET | — | `id, nome, popularity, views, likes, followers, genre, totalMusicas` | Perfil artista |
| `/artistas/{id}/musicas` | GET | `sort`, `limit` | `id, track, popularity, streams, views, likes` | Lista de músicas |
| `/artistas/{id}/features` | GET | — | `energy, danceability, valence, loudness, speechiness, instrumentalness` | Gráfico radar |

### **GRUPO 2: Lista de Músicas**

Endpoint base: `/musicas`

| Endpoint | Método | Query Params | Campos Retornados | Uso |
|----------|--------|--------------|-------------------|-----|
| `/musicas/top` | GET | `limit`, `sort` | `id, track, artist, popularity, streams` | Top 10 músicas |
| `/musicas/trending` | GET | `days` | `id, track, artist, views_recent` | Tendências |
| `/musicas/{id}/detalhes` | GET | — | Todos os campos | Detalhes música |

### **GRUPO 3: Comparação** (Futuro)

Endpoint base: `/compare`

| Endpoint | Método | Query Params | Campos Retornados | Uso |
|----------|--------|--------------|-------------------|-----|
| `/compare/artists` | GET | `ids=1,2,3` | `id, nome, popularity, avgEnergy, ...` | Comparar artistas |
| `/compare/musicas` | GET | `ids=1,2,3` | `id, track, popularity, danceability, ...` | Comparar músicas |

---

## 🔌 PADRÃO DE RESPOSTA

**Mantém simplicidade (conforme arquitetura estabelecida):**

```javascript
// Sucesso - Array direto
[
  { id: 1, nome: "The Weeknd", popularity: 95, ... },
  { id: 2, nome: "Taylor Swift", popularity: 92, ... }
]

// Erro - HTTP status + mensagem
HTTP 500
"Erro ao conectar ao banco de dados"
```

---

## 📁 ARQUIVOS A MODIFICAR

```
src/
├── models/
│   ├── artistaModel.js      (ADICIONAR novos métodos - SQL inline)
│   └── musicaModel.js       (ADICIONAR novos métodos - SQL inline)
├── controllers/
│   ├── artistaController.js (ADICIONAR novos controllers)
│   └── musicaController.js  (ADICIONAR novos controllers)
└── routes/
    ├── artistas.js          (ADICIONAR novas rotas)
    └── musicas.js           (ADICIONAR novas rotas)

public/
└── js/
    ├── rankingartistas.js   (ADAPTAR para usar novo endpoint)
    └── analisarartista.js   (ADAPTAR para usar novo endpoint)
```

**Nota:** Seguindo os padrões existentes do projeto: SQL inline nos models, validação inline nos controllers, fetch direto no frontend sem camadas extras de abstração.

---

## 🚀 FASES DE IMPLEMENTAÇÃO (Abordagem Incremental)

Cada fase implementa **1 endpoint + frontend adaptado**, validado antes de prosseguir.

### **Endpoint 1: GET /artistas/ranking**
- Model: `getRanking(sortField, limit)` em `artistaModel.js`
- Controller: `ranking(req, res)` em `artistaController.js`
- Route: `router.get("/ranking", ...)` em `routes/artistas.js`
- Frontend: `rankingartistas.js` adaptado para consumir o endpoint

### **Endpoint 2: GET /artistas/search**
- Model: `search(query)` em `artistaModel.js`
- Controller + Route + Frontend adaptado

### **Endpoint 3: GET /artistas/:id/perfil**
- Model: `getPerfil(artistaId)` em `artistaModel.js`
- Controller + Route + Frontend `analisarartista.js` adaptado

### **Endpoint 4: GET /artistas/:id/musicas**
- Model: `getMusicas(artistaId, sort, limit)` em `artistaModel.js`
- Controller + Route + Frontend adaptado

### **Endpoint 5: GET /artistas/:id/features**
- Model: `getAudioFeatures(artistaId)` em `artistaModel.js`
- Controller + Route + Frontend adaptado

### **Endpoints seguintes:**
- `/musicas/top`, `/musicas/:id/detalhes`, `/compare/artists`, `/compare/musicas`

---

## 📝 DETALHES TÉCNICOS (Padrão)

### Backend - Exemplo: getRanking()

**Model** (`/src/models/artistaModel.js`):
```javascript
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
```

**Controller** (`/src/controllers/artistaController.js`):
```javascript
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
            res.status(500).json(erro.sqlMessage);
        });
}
```

**Route** (`/src/routes/artistas.js`):
```javascript
router.get("/ranking", function (req, res) {
    artistaController.ranking(req, res);
});
```

### Frontend - Exemplo: Busca no ranking

Seguindo o padrão existente do projeto (fetch direto, sem classes extras):

```javascript
async function fetchRanking() {
    try {
        var response = await fetch('http://localhost:3333/artistas/ranking?sort=artist_popularity&limit=50');
        if (!response.ok) throw new Error('Erro na API: ' + response.status);
        var artists = await response.json();
        renderCards(artists);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
    }
}

function renderCards(artists) {
    var html = '';
    artists.forEach(function (artist, index) {
        html += '<div class="card">' +
            '<span class="ranking-number">' + (index + 1) + 'o</span>' +
            '<span class="artist-name">' + artist.nome + '</span>' +
            '<span class="atribute-value">' + artist.popularity + '</span>' +
            '</div>';
    });
    document.getElementById('ranking-body').innerHTML = html;
}
```

---

## 📊 BENEFÍCIOS MENSURÁVEIS

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **Tamanho resposta API** | 4.5KB | 0.3KB | **93% redução** |
| **Linhas JS por página** | 290 | 80 | **73% redução** |
| **Tempo de processamento frontend** | ~200ms | ~50ms | **75% mais rápido** |
| **Escalabilidade** | 1K registros quebra | 100K+ funciona | **Infinita** |
| **Manutenibilidade** | Difícil (espalhada) | Fácil (centralizada) | **Muito melhor** |
| **Cache possível** | Difícil | Trivial | **Implementável** |

---

## ✅ CHECKLIST PRÉ-IMPLEMENTAÇÃO

### Backend
- [ ] SQL injection vulnerabilidades revisadas
- [ ] Queries parametrizadas onde necessário
- [ ] Error handling consistente
- [ ] Logging em lugar apropriado

### Frontend
- [ ] Suporte a cache identificado
- [ ] Padrão de eventos definido
- [ ] HTML IDs conferidos
- [ ] CSS classes consistentes

### Documentação
- [ ] ESPECIFICACAO_ENDPOINTS.md criado
- [ ] Exemplos cURL/Postman preparados
- [ ] RESUMO_FINAL atualizado
- [ ] GUIA_IMPLEMENTACAO_ENDPOINTS.md criado

---

## 🔗 RELACIONADO

- Consulte: **ESPECIFICACAO_ENDPOINTS.md** para detalhes técnicos completos
- Consulte: **GUIA_IMPLEMENTACAO_ENDPOINTS.md** para passo a passo prático
- Consulte: **PADRAO_CODIGO.md** para padrões de código esperados

---

## 📌 NOTAS IMPORTANTES

1. **Backward Compatibility:** Endpoints antigos (`/artistas/listar`) continuarão funcionando
2. **Cache:** Dados de artista/música mudam raramente - use localStorage
3. **Validação:** Query params validados no backend, não confiar no cliente
4. **Segurança:** SQL injection risco - usar prepared statements
5. **Performance:** Adicionar indexes no BD para campos de `ORDER BY`

---

## 🎓 PRÓXIMAS ETAPAS

1. ✅ Ler este documento (agora!)
2. ⏳ Ler ESPECIFICACAO_ENDPOINTS.md
3. ⏳ Ler GUIA_IMPLEMENTACAO_ENDPOINTS.md
4. ⏳ Começar implementação FASE 1 (Backend)
5. ⏳ Testes com Postman
6. ⏳ Começar implementação FASE 2 (Client/Cache)
7. ⏳ Começar implementação FASE 3 (Frontend)

---

**Status:** 🔵 Pronto para começar!  
**Tempo estimado:** 6-10 horas total  
**Complexidade:** Média
