# 🔌 ESPECIFICAÇÃO TÉCNICA: Endpoints RESTful

**Data:** 21 de Maio de 2026  
**Versão:** 1.0  
**Status:** 📋 Especificação Completa

---

## 📑 ÍNDICE

1. [Convenções](#convenções)
2. [Grupo 1: Ranking Artistas](#grupo-1-ranking-artistas)
3. [Grupo 2: Detalhes Artista](#grupo-2-detalhes-artista)
4. [Grupo 3: Músicas](#grupo-3-músicas)
5. [Grupo 4: Comparação](#grupo-4-comparação-futuro)
6. [Respostas de Erro](#respostas-de-erro)
7. [Exemplos cURL](#exemplos-curl)

---

## 📐 CONVENÇÕES

### Base URL
```
http://localhost:3333
```

### Query Parameters Padrão
```
?sort=campo          - Campo para ordenar (DESC por padrão)
?limit=50            - Limite de resultados (padrão: 50)
?offset=0            - Offset para paginação (padrão: 0)
?q=termo             - Termo de busca (case-sensitive)
```

### Resposta Sucesso (Status 200)
```javascript
// Array de objetos
[
  { campo1: valor, campo2: valor },
  { campo1: valor, campo2: valor }
]

// Ou objeto único
{ campo1: valor, campo2: valor }
```

### Resposta Erro
```
HTTP 400/500
"Mensagem de erro simples"
```

---

## 🎭 GRUPO 1: Ranking Artistas

### Endpoint 1.1: Listar Ranking

**Rota:** `GET /artistas/ranking`

**Query Parameters:**
- `sort` (opcional): `popularity` | `views` | `likes` (padrão: `popularity`)
- `limit` (opcional): 1-100 (padrão: 50)
- `offset` (opcional): 0+ (padrão: 0)

**Retorna:**
```javascript
[
  {
    "id": 1,
    "nome": "The Weeknd",
    "genre": "Pop, Electronic, R&B",
    "popularity": 95,
    "views": 5000000000,
    "likes": 250000000
  },
  // ...
]
```

**Exemplos de uso:**

```bash
# Top 50 por popularidade
GET /artistas/ranking

# Top 10 por views
GET /artistas/ranking?sort=views&limit=10

# Artistas 50-100 por likes
GET /artistas/ranking?sort=likes&offset=50&limit=50
```

**SQL Gerado:**
```sql
SELECT 
  id_artista as id,
  nome,
  artist_genre as genre,
  artist_popularity as popularity,
  views,
  likes
FROM artista
ORDER BY artist_popularity DESC
LIMIT 50 OFFSET 0;
```

---

### Endpoint 1.2: Buscar Artista

**Rota:** `GET /artistas/search`

**Query Parameters:**
- `q` (obrigatório): Termo de busca
- `limit` (opcional): 1-50 (padrão: 10)

**Retorna:**
```javascript
[
  {
    "id": 1,
    "nome": "Taylor Swift",
    "genre": "Pop, Country",
    "popularity": 92
  },
  // ...
]
```

**Exemplos:**
```bash
# Buscar "Taylor"
GET /artistas/search?q=Taylor

# Buscar "The" com limite de 5
GET /artistas/search?q=The&limit=5
```

**SQL:**
```sql
SELECT 
  id_artista as id,
  nome,
  artist_genre as genre,
  artist_popularity as popularity
FROM artista
WHERE nome LIKE '%Taylor%'
LIMIT 10;
```

---

## 👤 GRUPO 2: Detalhes Artista

### Endpoint 2.1: Perfil do Artista

**Rota:** `GET /artistas/{id}/perfil`

**Parâmetros de Rota:**
- `id` (obrigatório): ID do artista

**Retorna:**
```javascript
{
  "id": 1,
  "nome": "The Weeknd",
  "popularity": 95,
  "views": 5000000000,
  "likes": 250000000,
  "followers": 80000000,
  "genre": "Pop, Electronic, R&B",
  "totalMusicas": 150
}
```

**Exemplos:**
```bash
# Perfil do artista 1
GET /artistas/1/perfil
```

**SQL:**
```sql
SELECT 
  id_artista as id,
  nome,
  artist_popularity as popularity,
  views,
  likes,
  artist_followers as followers,
  artist_genre as genre,
  (SELECT COUNT(*) FROM musica WHERE fk_artista = 1) as totalMusicas
FROM artista
WHERE id_artista = 1;
```

---

### Endpoint 2.2: Músicas do Artista

**Rota:** `GET /artistas/{id}/musicas`

**Parâmetros de Rota:**
- `id` (obrigatório): ID do artista

**Query Parameters:**
- `sort` (opcional): `popularity` | `streams` | `views` | `likes` (padrão: `popularity`)
- `limit` (opcional): 1-500 (padrão: 50)
- `offset` (opcional): 0+ (padrão: 0)

**Retorna:**
```javascript
[
  {
    "id": 101,
    "track": "Blinding Lights",
    "popularity": 98,
    "streams": 3800000000,
    "views": 900000000,
    "likes": 25000000
  },
  // ...
]
```

**Exemplos:**
```bash
# Todas as músicas do artista 1, ordenadas por popularity
GET /artistas/1/musicas

# Top 10 por streams
GET /artistas/1/musicas?sort=streams&limit=10

# Músicas 100-150 por likes
GET /artistas/1/musicas?sort=likes&offset=100&limit=50
```

**SQL:**
```sql
SELECT 
  id_musica as id,
  track,
  track_popularity as popularity,
  streams,
  views,
  likes
FROM musica
WHERE fk_artista = 1
ORDER BY track_popularity DESC
LIMIT 50 OFFSET 0;
```

---

### Endpoint 2.3: Análise de Áudio (Features)

**Rota:** `GET /artistas/{id}/features`

**Parâmetros de Rota:**
- `id` (obrigatório): ID do artista

**Retorna:**
```javascript
{
  "energy": 0.65,
  "danceability": 0.72,
  "valence": 0.58,
  "loudness": -5.2,
  "speechiness": 0.03,
  "instrumentalness": 0.0
}
```

**Exemplos:**
```bash
# Features médias do artista 1
GET /artistas/1/features
```

**SQL:**
```sql
SELECT 
  ROUND(AVG(energy), 3) as energy,
  ROUND(AVG(danceability), 3) as danceability,
  ROUND(AVG(valence), 3) as valence,
  ROUND(AVG(loudness), 2) as loudness,
  ROUND(AVG(speechiness), 3) as speechiness,
  ROUND(AVG(instrumentalness), 3) as instrumentalness
FROM musica
WHERE fk_artista = 1;
```

---

## 🎵 GRUPO 3: Músicas

### Endpoint 3.1: Top Músicas

**Rota:** `GET /musicas/top`

**Query Parameters:**
- `sort` (opcional): `popularity` | `streams` | `views` (padrão: `popularity`)
- `limit` (opcional): 1-100 (padrão: 10)

**Retorna:**
```javascript
[
  {
    "id": 1,
    "track": "Blinding Lights",
    "artist": "The Weeknd",
    "artist_id": 1,
    "popularity": 98,
    "streams": 3800000000
  },
  // ...
]
```

**Exemplos:**
```bash
# Top 10 por popularity
GET /musicas/top

# Top 20 por streams
GET /musicas/top?sort=streams&limit=20
```

**SQL:**
```sql
SELECT 
  m.id_musica as id,
  m.track,
  a.nome as artist,
  a.id_artista as artist_id,
  m.track_popularity as popularity,
  m.streams
FROM musica m
JOIN artista a ON m.fk_artista = a.id_artista
ORDER BY m.track_popularity DESC
LIMIT 10;
```

---

### Endpoint 3.2: Músicas Tendências

**Rota:** `GET /musicas/trending`

**Query Parameters:**
- `days` (opcional): 7 | 30 | 90 (padrão: 30)
- `limit` (opcional): 1-50 (padrão: 10)

**Retorna:**
```javascript
[
  {
    "id": 1,
    "track": "Blinding Lights",
    "artist": "The Weeknd",
    "artist_id": 1,
    "views_recent": 900000000,
    "likes_recent": 25000000
  },
  // ...
]
```

**Exemplos:**
```bash
# Tendências últimos 30 dias
GET /musicas/trending

# Tendências últimos 7 dias, top 20
GET /musicas/trending?days=7&limit=20
```

**Nota:** Requer tabela de `musica_historico` com timestamp  
*(Implementação futura quando houver histórico)*

---

### Endpoint 3.3: Detalhes da Música

**Rota:** `GET /musicas/{id}/detalhes`

**Parâmetros de Rota:**
- `id` (obrigatório): ID da música

**Retorna:**
```javascript
{
  "id": 1,
  "track": "Blinding Lights",
  "artist": "The Weeknd",
  "artist_id": 1,
  "popularity": 98,
  "streams": 3800000000,
  "views": 900000000,
  "likes": 25000000,
  "energy": 0.939,
  "danceability": 0.846,
  "valence": 0.191,
  "loudness": -5.484,
  "speechiness": 0.029,
  "instrumentalness": 0.0
}
```

**Exemplos:**
```bash
# Detalhes da música 1
GET /musicas/1/detalhes
```

**SQL:**
```sql
SELECT 
  m.id_musica as id,
  m.track,
  a.nome as artist,
  a.id_artista as artist_id,
  m.track_popularity as popularity,
  m.streams,
  m.views,
  m.likes,
  m.energy,
  m.danceability,
  m.valence,
  m.loudness,
  m.speechiness,
  m.instrumentalness
FROM musica m
JOIN artista a ON m.fk_artista = a.id_artista
WHERE m.id_musica = 1;
```

---

## ⚖️ GRUPO 4: Comparação (Futuro)

### Endpoint 4.1: Comparar Artistas

**Rota:** `GET /compare/artists`

**Query Parameters:**
- `ids` (obrigatório): IDs separadas por vírgula (ex: `1,2,3`)

**Retorna:**
```javascript
[
  {
    "id": 1,
    "nome": "The Weeknd",
    "popularity": 95,
    "avgEnergy": 0.65,
    "avgDanceability": 0.72,
    "totalMusicas": 150
  },
  {
    "id": 2,
    "nome": "Taylor Swift",
    "popularity": 92,
    "avgEnergy": 0.58,
    "avgDanceability": 0.68,
    "totalMusicas": 200
  },
  // ...
]
```

**Exemplos:**
```bash
# Comparar artistas 1, 2 e 3
GET /compare/artists?ids=1,2,3
```

---

### Endpoint 4.2: Comparar Músicas

**Rota:** `GET /compare/musicas`

**Query Parameters:**
- `ids` (obrigatório): IDs separadas por vírgula

**Retorna:**
```javascript
[
  {
    "id": 1,
    "track": "Blinding Lights",
    "artist": "The Weeknd",
    "popularity": 98,
    "danceability": 0.846,
    "energy": 0.939
  },
  // ...
]
```

---

## ❌ Respostas de Erro

### Erro 400 - Requisição Inválida

```bash
GET /artistas/ranking?sort=invalido

Response (HTTP 400):
"Sort inválido. Use: popularity, views ou likes"
```

### Erro 404 - Não Encontrado

```bash
GET /artistas/999999/perfil

Response (HTTP 404):
"Artista não encontrado"
```

### Erro 500 - Erro Servidor

```bash
Response (HTTP 500):
"Erro ao conectar ao banco de dados"
```

---

## 🔧 Exemplos cURL

### Listar Ranking
```bash
curl -X GET "http://localhost:3333/artistas/ranking?sort=popularity&limit=5"
```

### Buscar Artista
```bash
curl -X GET "http://localhost:3333/artistas/search?q=Taylor&limit=5"
```

### Perfil Artista
```bash
curl -X GET "http://localhost:3333/artistas/1/perfil"
```

### Músicas Artista
```bash
curl -X GET "http://localhost:3333/artistas/1/musicas?sort=popularity&limit=10"
```

### Features de Áudio
```bash
curl -X GET "http://localhost:3333/artistas/1/features"
```

### Top Músicas
```bash
curl -X GET "http://localhost:3333/musicas/top?limit=10"
```

### Detalhes Música
```bash
curl -X GET "http://localhost:3333/musicas/1/detalhes"
```

---

## 📊 Mapeamento: Página → Endpoint

| Página | Endpoint Primário | Endpoints Secundários |
|--------|-------------------|----------------------|
| `rankingartistas.html` | `/artistas/ranking` | `/artistas/search` |
| `analisarartista.html` | `/artistas/{id}/perfil` | `/artistas/{id}/musicas`, `/artistas/{id}/features` |
| `listamusicas.html` | `/musicas/top` | `/musicas/{id}/detalhes` |
| `compararartistas.html` | `/compare/artists` | — |
| `compararmusicas.html` | `/compare/musicas` | — |

---

## 🔐 Validações

### Backend — validar no Controller antes de chamar o Model:

```javascript
// Sort (exemplo para ranking de artistas)
var sortField = req.query.sort || 'artist_popularity';
var validSorts = ['artist_popularity', 'views', 'likes'];
if (!validSorts.includes(sortField)) {
    return res.status(400).send("Sort invalido. Use: artist_popularity, views ou likes");
}

// Limit
var limit = parseInt(req.query.limit) || 50;
if (limit > 500) limit = 500;

// ID de rota
var id = parseInt(req.params.id);
if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
}

// Query string para busca
var query = req.query.q;
if (!query || query.trim().length < 2) {
    return res.status(400).send("Termo de busca deve ter +2 caracteres");
}
```

---

## 📝 Notas de Implementação

1. **SQL Injection:** Usar prepared statements para IDs e search terms
2. **Performance:** Adicionar indexes em campos de ORDER BY
3. **Cache:** Headers HTTP com ETag para cache do cliente
4. **Logging:** Logar requisições lentas (>500ms)
5. **Rate Limiting:** Considerar adicionar limite de requisições

---

## ✅ Checklist de Testes

- [ ] Endpoint 1.1 funciona com todos os sorts
- [ ] Endpoint 1.2 busca case-sensitive
- [ ] Endpoint 2.1 retorna dados corretos
- [ ] Endpoint 2.2 ordena por todas as opções
- [ ] Endpoint 2.3 calcula features corretamente
- [ ] Endpoint 3.1 retorna top músicas
- [ ] Endpoint 3.3 retorna todas as features
- [ ] Todos endpoints retornam HTTP corretos
- [ ] Erros retornam mensagens significativas

---

**Status:** ✅ Especificação Completa e Pronta para Implementação
