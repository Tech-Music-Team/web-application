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
    var url = '/musicas/top?sort=' + currentSortField + '&limit=10000';
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

    var nomeArtista = musica.artist || '';
    html += `
      <div class="card">
        <div class="left-content-group">
          <span class="ranking-number">${position}o</span>
          <div class="spotify-artist-img" data-artist-name="${nomeArtista.replace(/"/g, '&quot;')}" style="width: 65px; height: 65px;
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
            <span class="atribute-value">${formatarNumero(musica.streams)}</span>
          </li>
          <li>
            <span class="artist-atribute">Views</span>
            <span class="atribute-value">${formatarNumero(musica.views)}</span>
          </li>
          <li>
            <span class="artist-atribute">Likes</span>
            <span class="atribute-value">${formatarNumero(musica.likes)}</span>
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
  carregarImagensArtistas();
}

function carregarImagensArtistas() {
  var elementos = document.querySelectorAll('.spotify-artist-img');
  elementos.forEach(function (el, index) {
    var nome = el.getAttribute('data-artist-name');
    if (nome) {
      setTimeout(function () {
        carregarImagemSpotify(nome, el);
      }, index * 150);
    }
  });
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

function getFirstGenre(genreString) {
  if (!genreString) return 'Desconhecido';
  return genreString.split(',')[0].trim();
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
    var response = await fetch('/musicas/search?q=' + encodeURIComponent(term) + '&limit=10000');
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
