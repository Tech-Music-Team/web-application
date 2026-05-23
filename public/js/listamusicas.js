let musics = [];
let filteredMusics = [];
let currentSortField = 'track_popularity';
let currentSortOrder = 'desc';
const sortFields = ['track_popularity', 'streams', 'views'];
let currentSortFieldIndex = 0;
let isFiltering = false;
let currentPage = 1;
const itemsPerPage = 50;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    validarSessao();
    await fetchTopMusics();
    renderCards();
    updateUI();
    attachEventListeners();
  } catch (error) {
    console.error('Erro durante inicializacao:', error);
  }
});

async function fetchTopMusics() {
  try {
    var url = 'http://localhost:3333/musicas/top?sort=' + currentSortField + '&limit=10000';
    var response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro na API: ' + response.status);
    }
    musics = await response.json();
    filteredMusics = [...musics];
    currentPage = 1;
  } catch (error) {
    console.error('Erro ao buscar musicas:', error);
    document.getElementById('ranking-body').innerHTML =
      '<p style="text-align: center; padding: 40px; color: #999;">Erro ao carregar musicas. Tente novamente.</p>';
  }
}

function getCurrentPageItems() {
  var source = isFiltering ? filteredMusics : musics;
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  return source.slice(start, end);
}

function getTotalPages() {
  var source = isFiltering ? filteredMusics : musics;
  return Math.max(1, Math.ceil(source.length / itemsPerPage));
}

function renderCards() {
  var pageItems = getCurrentPageItems();
  var start = (currentPage - 1) * itemsPerPage;

  var html = '';
  pageItems.forEach(function (musica, index) {
    var position = start + index + 1;
    var color = getPlaceholderColor(musica.id);
    var artistGenre = musica.artist + ' • ' + getFirstGenre(musica.genre);

    html += `
      <div class="card">
        <div class="left-content-group">
          <span class="ranking-number">${position}o</span>
          <div style="width: 65px; height: 65px;
                      background-color: ${color};
                      border-radius: 8px;
                      flex-shrink: 0;">
          </div>
          <div class="artist-info-header">
            <span class="artist-name">${musica.track}</span>
            <span class="genre">${artistGenre}</span>
          </div>
        </div>
        <ul>
          <li>
            <span class="artist-atribute">Streams</span>
            <span class="atribute-value">${formatNumber(musica.streams)}</span>
          </li>
          <li>
            <span class="artist-atribute">Views</span>
            <span class="atribute-value">${formatNumber(musica.views)}</span>
          </li>
          <li>
            <span class="artist-atribute">Likes</span>
            <span class="atribute-value">${formatNumber(musica.likes)}</span>
          </li>
        </ul>
        <div class="right-content-group">
          <button class="btn-add-setlist" data-musica-id="${musica.id}" data-musica-name="${musica.track}" title="Adicionar a playlist">
            <span class="material-symbols-outlined">playlist_add</span>
          </button>
          <button class="details-button" data-musica-id="${musica.id}">Detalhes da musica</button>
        </div>
      </div>
    `;
  });

  document.getElementById('ranking-body').innerHTML = html;
  colorRankingNumbers();
}

function updateUI() {
  var source = isFiltering ? filteredMusics : musics;
  var totalPages = getTotalPages();
  document.getElementById('page-info').textContent = 'Pagina ' + currentPage + ' de ' + totalPages + ' (' + source.length + ' musicas)';

  var btnPrev = document.getElementById('btn-anterior');
  var btnNext = document.getElementById('btn-proxima');

  if (btnPrev) {
    btnPrev.disabled = currentPage <= 1;
  }
  if (btnNext) {
    btnNext.disabled = currentPage >= totalPages;
  }
}

function attachEventListeners() {
  var searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      filterMusics(e.target.value);
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
    var btnSetlist = e.target.closest('.btn-add-setlist');
    if (btnSetlist) {
      var musicaId = btnSetlist.getAttribute('data-musica-id');
      var musicaName = btnSetlist.getAttribute('data-musica-name');
      if (musicaId) {
        adicionarASetlist(parseInt(musicaId), musicaName);
      }
      return;
    }

    if (e.target.classList.contains('details-button')) {
      var musicaId = e.target.getAttribute('data-musica-id');
      if (musicaId) {
        window.location.href = 'analisarMusica.html?id=' + musicaId;
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

function getPlaceholderColor(musicId) {
  var cores = [
    '#A855F7', '#D421BF', '#EC4899', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'
  ];
  return cores[musicId % cores.length];
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

async function filterMusics(searchTerm) {
  var term = searchTerm.trim();

  if (!term) {
    filteredMusics = [...musics];
    isFiltering = false;
    currentPage = 1;
    renderCards();
    updateUI();
    return;
  }

  try {
    var response = await fetch('http://localhost:3333/musicas/search?q=' + encodeURIComponent(term) + '&limit=10000');
    if (!response.ok) throw new Error('Erro na busca: ' + response.status);
    filteredMusics = await response.json();
    isFiltering = true;
  } catch (error) {
    console.error('Erro ao buscar musicas:', error);
    filteredMusics = [];
  }

  currentPage = 1;

  if (filteredMusics.length === 0) {
    document.getElementById('ranking-body').innerHTML =
      '<p style="text-align: center; padding: 40px; color: #999;">Nenhuma musica encontrada para: "' + term + '"</p>';
    document.getElementById('page-info').textContent = 'Nenhum resultado';
  } else {
    renderCards();
    updateUI();
  }
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  document.getElementById('btn-clear-search').style.display = 'none';
  filteredMusics = [...musics];
  isFiltering = false;
  currentPage = 1;
  renderCards();
  updateUI();
}

async function rotateSort(direction) {
  currentSortFieldIndex = (currentSortFieldIndex + 1) % sortFields.length;
  currentSortField = sortFields[currentSortFieldIndex];
  currentSortOrder = direction === 'up' ? 'desc' : 'asc';

  await fetchTopMusics();
  isFiltering = false;
  renderCards();
  updateUI();
}

function scrollToTop() {
  var container = document.querySelector('.ranking-body');
  if (container) {
    container.scrollTop = 0;
  }
}
