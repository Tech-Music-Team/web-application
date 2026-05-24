let artists = [];
let filteredArtists = [];
let currentSortField = 'artist_popularity';
let currentSortOrder = 'desc';
const sortFields = ['artist_popularity', 'views', 'likes'];
let currentSortFieldIndex = 0;
let isFiltering = false;
let currentPage = 1;
const itemsPerPage = 50;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    validarSessao();
    await fetchRanking();
    renderCards();
    updateUI();
    attachEventListeners();
  } catch (error) {
    console.error('Erro durante inicializacao:', error);
  }
});

async function fetchRanking() {
  try {
    var url = 'http://localhost:3333/artistas/ranking?sort=' + currentSortField + '&limit=1000&order=' + currentSortOrder;
    var response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro na API: ' + response.status);
    }
    artists = await response.json();
    filteredArtists = [...artists];
    currentPage = 1;
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    document.getElementById('ranking-body').innerHTML =
      '<p style="text-align: center; padding: 40px; color: #999;">Erro ao carregar ranking. Tente novamente.</p>';
  }
}

function getCurrentPageItems() {
  var source = isFiltering ? filteredArtists : artists;
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  return source.slice(start, end);
}

function getTotalPages() {
  var source = isFiltering ? filteredArtists : artists;
  return Math.max(1, Math.ceil(source.length / itemsPerPage));
}

function renderCards() {
  var pageItems = getCurrentPageItems();
  var start = (currentPage - 1) * itemsPerPage;

  var html = '';
  pageItems.forEach(function (artista, index) {
    var position = start + index + 1;
    var placeholderColor = getPlaceholderColor(artista.id);
    var firstGenre = getFirstGenre(artista.genre);

    html += `
      <div class="card">
        <div class="left-content-group">
          <span class="ranking-number">${position}o</span>
          <div class="spotify-artist-img" data-artist-name="${artista.nome.replace(/"/g, '&quot;')}" style="width: 65px; height: 65px;
                      background-color: ${placeholderColor};
                      border-radius: 8px;
                      flex-shrink: 0;">
          </div>
          <div class="artist-info-header">
            <span class="artist-name">${artista.nome}</span>
            <span class="genre">Genero: ${firstGenre}</span>
          </div>
        </div>
        <ul>
          <li>
            <span class="artist-atribute">Popularidade</span>
            <span class="atribute-value">${artista.popularity}</span>
          </li>
          <li>
            <span class="artist-atribute">Views</span>
            <span class="atribute-value">${formatNumber(artista.views)}</span>
          </li>
          <li>
            <span class="artist-atribute">Likes</span>
            <span class="atribute-value">${formatNumber(artista.likes)}</span>
          </li>
        </ul>
        <div class="right-content-group">
          <button class="btn-add-lineup" data-artist-id="${artista.id}" data-artist-name="${artista.nome}" title="Adicionar a lineup">
            <span class="material-symbols-outlined">playlist_add</span>
          </button>
          <button class="details-button" data-artist-id="${artista.id}">Detalhes do artista</button>
        </div>
      </div>
    `;
  });

  document.getElementById('ranking-body').innerHTML = html;
  colorRankingNumbers();
  carregarImagensArtistas();
}

function carregarImagensArtistas() {
  var elementos = document.querySelectorAll('.spotify-artist-img');
  elementos.forEach(function (el) {
    var nome = el.getAttribute('data-artist-name');
    if (nome) carregarImagemSpotify(nome, el);
  });
}

function updateUI() {
  var source = isFiltering ? filteredArtists : artists;
  var totalPages = getTotalPages();
  document.getElementById('page-info').textContent = 'Pagina ' + currentPage + ' de ' + totalPages + ' (' + source.length + ' artistas)';

  var btnPrev = document.getElementById('btn-anterior');
  var btnNext = document.getElementById('btn-proxima');

  if (btnPrev) {
    btnPrev.disabled = currentPage <= 1;
  }
  if (btnNext) {
    btnNext.disabled = currentPage >= totalPages;
  }

  updateSortButtonsUI();
}

function attachEventListeners() {
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      filterArtistas(e.target.value);
      var btnClear = document.getElementById('btn-clear-search');
      if (btnClear) {
        btnClear.style.display = e.target.value ? 'flex' : 'none';
      }
    });
  }

  var btnClear = document.getElementById('btn-clear-search');
  if (btnClear) {
    btnClear.addEventListener('click', clearSearch);
  }

  var btnSortUp = document.getElementById('btn-sort-up');
  var btnSortDown = document.getElementById('btn-sort-down');

  if (btnSortUp) {
    btnSortUp.addEventListener('click', function () { rotateSort('up'); });
  }
  if (btnSortDown) {
    btnSortDown.addEventListener('click', function () { rotateSort('down'); });
  }

  var btnPrev = document.getElementById('btn-anterior');
  var btnNext = document.getElementById('btn-proxima');

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--;
        renderCards();
        updateUI();
        scrollToTop();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (currentPage < getTotalPages()) {
        currentPage++;
        renderCards();
        updateUI();
        scrollToTop();
      }
    });
  }

  document.getElementById('ranking-body').addEventListener('click', function (e) {
    var btnLineup = e.target.closest('.btn-add-lineup');
    if (btnLineup) {
      var artistId = btnLineup.getAttribute('data-artist-id');
      var artistName = btnLineup.getAttribute('data-artist-name');
      if (artistId) {
        adicionarALineup(parseInt(artistId), artistName);
      }
      return;
    }

    if (e.target.classList.contains('details-button')) {
      var artistId = e.target.getAttribute('data-artist-id');
      if (artistId) {
        window.location.href = 'analisarartista.html?id=' + artistId;
      }
    }
  });
}

function formatNumber(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}

function getPlaceholderColor(artistId) {
  var cores = [
    '#A855F7', '#D421BF', '#EC4899', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'
  ];
  return cores[artistId % cores.length];
}

function getFirstGenre(genreString) {
  if (!genreString) return 'Desconhecido';
  return genreString.split(',')[0].trim();
}

function colorRankingNumbers() {
  var rankings = document.querySelectorAll('.ranking-number');
  var cores = {
    '1o': '#D4AF37',
    '2o': '#A8A9AD',
    '3o': '#CD7F32',
  };

  rankings.forEach(function (el) {
    var cor = cores[el.textContent.trim()];
    el.style.color = cor || '#000000';
  });
}

function filterArtistas(searchTerm) {
  var term = searchTerm.trim();

  if (!term) {
    filteredArtists = [...artists];
    isFiltering = false;
  } else {
    filteredArtists = artists.filter(function (artista) {
      return artista.nome.toLowerCase().includes(term.toLowerCase());
    });
    isFiltering = true;
  }

  currentPage = 1;

  if (filteredArtists.length === 0 && term) {
    document.getElementById('ranking-body').innerHTML =
      '<p style="text-align: center; padding: 40px; color: #999;">Nenhum artista encontrado para: "' + term + '"</p>';
    document.getElementById('page-info').textContent = 'Nenhum resultado';
  } else {
    renderCards();
    updateUI();
  }
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('btn-clear-search').style.display = 'none';
  filteredArtists = [...artists];
  isFiltering = false;
  currentPage = 1;
  renderCards();
  updateUI();
}

async function rotateSort(direction) {
  currentSortFieldIndex = (currentSortFieldIndex + 1) % sortFields.length;
  currentSortField = sortFields[currentSortFieldIndex];
  currentSortOrder = direction === 'up' ? 'desc' : 'asc';

  await fetchRanking();
  isFiltering = false;
  renderCards();
  updateUI();
}

function updateSortButtonsUI() {
  var fieldNames = {
    'artist_popularity': 'Popularidade',
    'views': 'Views',
    'likes': 'Likes'
  };

  var orderText = currentSortOrder === 'desc' ? '↓' : '↑';
  var fieldText = fieldNames[currentSortField];

  var label = document.getElementById('sort-label');
  if (label) {
    label.textContent = fieldText + ' ' + orderText;
  }

  var orderUp = document.querySelector('.order-toggle .order-up');
  var orderDown = document.querySelector('.order-toggle .order-down');

  if (orderUp && orderDown) {
    orderUp.classList.toggle('active', currentSortOrder === 'desc');
    orderDown.classList.toggle('active', currentSortOrder === 'asc');
  }
}

function scrollToTop() {
  var container = document.querySelector('.ranking-body');
  if (container) {
    container.scrollTop = 0;
  }
}
