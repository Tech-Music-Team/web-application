# 📋 PADRÃO DE CÓDIGO - PRÓXIMAS FEATURES

**Estabelecido em:** 21 de Maio de 2026  
**Versão:** 1.0

---

## 🎯 Princípios Gerais

1. **Código Limpo:** Remover ou minimizar comentários
2. **Nomenclatura Clara:** Nomes de função e variável descritivos
3. **Organização Lógica:** Agrupar funções por responsabilidade
4. **Sem Redundância:** Reutilizar código quando possível

---

## 📐 Estrutura de Arquivo JavaScript (Frontend)

```javascript
// 1. ESTADO GLOBAL
let stateVariable1 = [];
let stateVariable2 = null;

// 2. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', async () => {
  try {
    validarSessao();
    await fetchData();
    renderUI();
    attachEventListeners();
  } catch (error) {
    console.error('Erro:', error);
  }
});

// 3. FUNÇÕES PRINCIPAIS (Lógica de negócio)
async function fetchData() { }
function renderUI() { }
function handleUserAction() { }

// 4. FUNÇÕES UTILITÁRIAS (Helpers)
function formatNumber(value) { }
function getPlaceholderColor(id) { }

// 5. EVENT LISTENERS (Interação do usuário)
function attachEventListeners() { }
```

---

## 🏗️ Estrutura de Arquivo Backend (Model → Controller → Route)

### Model (`/src/models/...Model.js`)

Responsável pela comunicação com o banco de dados. SQL é escrito inline em template literals.

```javascript
var database = require("../database/config");

function nomeDaFuncao(param1, param2) {
    var instrucao = `
        SELECT campos
        FROM tabela
        WHERE condicao = '${param1}'
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    nomeDaFuncao
};
```

### Controller (`/src/controllers/...Controller.js`)

Recebe a requisição, chama o model e devolve a resposta em JSON.

```javascript
var model = require("../models/...Model");

function nomeDaFuncao(req, res) {
    var param = req.query.param || 'valorPadrao';

    model.nomeDaFuncao(param)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    nomeDaFuncao
};
```

**Regras:**
- Usar `var` para variáveis (padrão do projeto)
- Usar `function () {}` (não arrow functions) nos `.then()` / `.catch()`
- Resposta de sucesso: `res.status(200).json(resultado)`
- Resposta de erro: `res.status(500).json(erro.sqlMessage)`
- Validações simples podem ser feitas antes de chamar o model, retornando `res.status(400).send("mensagem")`

### Route (`/src/routes/...js`)

Mapeia URLs para os controllers.

```javascript
var express = require("express");
var router = express.Router();

var controller = require("../controllers/...Controller");

router.get("/caminho", function (req, res) {
    controller.nomeDaFuncao(req, res);
});

module.exports = router;
```

**Regras:**
- Rotas específicas (sem parâmetro) devem vir ANTES de rotas com `:id`
- Usar `router.get()` para consultas, `router.post()` para criação
- Sempre exportar com `module.exports = router`

### app.js — Registrar nova rota

Quando criar um novo arquivo de rotas, registrá-lo no `app.js`:

```javascript
var novoRouter = require("./src/routes/novo");

// ...

app.use("/caminho", novoRouter);
```

---

## ✅ O Que Fazer

### Comentários
- ✅ Comentários APENAS para lógica complexa
- ✅ Uma linha, breve e claro
- ✅ Exemplo: `const price = subtotal * tax; // Aplicar imposto`

### Nomes
- ✅ Variáveis: `camelCase` - `currentPage`, `totalArtists`
- ✅ Funções: `camelCase` - `fetchArtistas()`, `renderCards()`
- ✅ Constantes: `UPPER_CASE` - `const ITEMS_PER_PAGE = 50`
- ✅ Booleanos: `is*` ou `has*` - `isFiltering`, `hasError`

### Estrutura
- ✅ Estado global no topo
- ✅ Inicialização em DOMContentLoaded
- ✅ Agrupar funções por tipo (fetch, render, utility)
- ✅ Usar arrow functions para callbacks: `() => {}`

---

## ❌ O Que NÃO Fazer

### Comentários
- ❌ Comentários em bloco para cada função
- ❌ Comentários óbvios: `// Incrementar contador` acima de `count++`
- ❌ Comentários em português acima de cada seção

### Nomes
- ❌ Abreviações: `arr`, `obj`, `str` (use `artists`, `config`, `searchTerm`)
- ❌ Nomes genéricos: `data`, `result`, `temp`
- ❌ Misturar idiomas: `getDadosArtista()` (use `getArtistData()`)

### Estrutura
- ❌ Var ou Let globais sem razão
- ❌ Funções muito longas (>50 linhas)
- ❌ Lógica HTML inline em JavaScript (usar template strings)

---

## 📝 Exemplos Recomendados

### ✅ CORRETO

```javascript
let allArtists = [];
let filteredArtists = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 50;

async function fetchArtists() {
  try {
    const response = await fetch('/api/artists');
    allArtists = await response.json();
    filteredArtists = [...allArtists];
  } catch (error) {
    console.error('Failed to fetch artists:', error);
  }
}

function formatNumber(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}
```

### ❌ EVITAR

```javascript
// ESTADO GLOBAL PARA ARTISTAS
let allArtists = [];
// ARTISTAS FILTRADOS
let filteredArtists = [];
// PÁGINA ATUAL
let currentPage = 1;

// Busca artistas da API
async function fetch_artistas() {
  try {
    const resp = await fetch('/api/artists');
    const result = await resp.json();
    allArtists = result;
    filteredArtists = [...result];
    console.log('Artists loaded successfully');
  } catch (err) {
    console.error('Error:', err);
  }
}

// Formata número em texto legível
function fmt_number(num) {
  // Converter para bilhões
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
  // Converter para milhões
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  // Converter para milhares
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  // Retornar como string
  return num.toString();
}
```

---

## 🔄 Padrão de Renderização de Cards

```javascript
function renderCards(items) {
  const container = document.getElementById('container-id');
  
  let html = '';
  items.forEach((item, index) => {
    html += `
      <div class="card">
        <span class="ranking">${index + 1}º</span>
        <div class="placeholder" style="background-color: ${getPlaceholderColor(item.id)}"></div>
        <span class="title">${item.name}</span>
        <button class="action-btn" data-id="${item.id}">Ação</button>
      </div>
    `;
  });
  
  container.innerHTML = html;
}
```

---

## 🎨 Padrão de Event Delegation

```javascript
function attachEventListeners() {
  // Busca/Filtro
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterItems(e.target.value);
    });
  }
  
  // Ação nos botões dinâmicos
  document.getElementById('container-id').addEventListener('click', (e) => {
    if (e.target.classList.contains('action-btn')) {
      const id = e.target.getAttribute('data-id');
      handleAction(id);
    }
  });
}
```

---

## 🚀 Checklist Antes de Commitar

- [ ] Remover console.log desnecessários
- [ ] Verificar se há comentários óbvios (remover)
- [ ] Nomes de variáveis estão claros?
- [ ] Funções têm responsabilidade única?
- [ ] Código funciona sem erros no console?
- [ ] HTML dinâmico usa template strings
- [ ] Event listeners usam delegação quando apropriado
- [ ] Arquivos CSS/HTML/JS foram modificados?
- [ ] Atualizar RESUMO_FINAL_TODAS_IMPLEMENTACOES.txt

---

## 📊 Estatísticas de Código (Referência)

| Métrica | rankingartistas.js | analisarartista.js |
|---------|--------------------|--------------------|
| Linhas totais | 292 | 322 |
| Linhas de código | 280 | 310 |
| Funções | 16 | 14 |
| Linhas/Função | ~18 | ~22 |

**Meta:** Manter < 30 linhas por função para legibilidade

---

## 💡 Dicas de Manutenção

1. **Se uma função > 50 linhas:** Quebrar em funções menores
2. **Se código se repete 2x:** Extrair para função utilitária
3. **Se muitos IFs aninhados:** Considerar switch ou refatorar
4. **Se evento é complexo:** Usar função nomeada ao invés de arrow

---

## 🔗 Referências

- rankingartistas.js: Exemplo de filtro + ordenação + paginação
- analisarartista.js: Exemplo de carregamento dinâmico + renderização múltipla

Seguir este padrão garante código consistente, legível e fácil de manter!
