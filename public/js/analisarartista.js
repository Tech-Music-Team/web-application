let currentArtistId = null;
let artistData = null;
let artistMusics = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    validarSessao();

    currentArtistId = getArtistIdFromURL();

    if (!currentArtistId) {
      showError('ID do artista nao fornecido na URL');
      return;
    }

    const [perfil, musicas, features] = await Promise.all([
      fetchArtistPerfil(currentArtistId),
      fetchArtistMusics(currentArtistId),
      fetchArtistFeatures(currentArtistId)
    ]);

    if (!perfil) {
      showError('Artista nao encontrado');
      return;
    }

    artistData = perfil;
    artistMusics = musicas;

    renderArtistProfile(perfil);
    renderRadarChart(features);
    renderMusicCards(musicas);
    attachEventListeners();

  } catch (error) {
    console.error('Erro durante inicializacao:', error);
    showError('Erro ao carregar dados do artista');
  }
});

function getArtistIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  return id ? parseInt(id) : null;
}

async function fetchArtistPerfil(artistId) {
  try {
    const response = await fetch('http://localhost:3333/artistas/' + artistId + '/perfil');
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Erro na API: ' + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar perfil do artista:', error);
    throw error;
  }
}

async function fetchArtistMusics(artistId) {
  try {
    const response = await fetch('http://localhost:3333/artistas/' + artistId + '/musicas?limit=500');
    if (!response.ok) {
      throw new Error('Erro na API: ' + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar musicas do artista:', error);
    return [];
  }
}

async function fetchArtistFeatures(artistId) {
  try {
    const response = await fetch('http://localhost:3333/artistas/' + artistId + '/features');
    if (!response.ok) {
      throw new Error('Erro na API: ' + response.status);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar features do artista:', error);
    return { energy: 0, danceability: 0, valence: 0, loudness: 0, speechiness: 0, instrumentalness: 0 };
  }
}

function renderArtistProfile(artista) {
  const placeholderColor = getPlaceholderColor(artista.id);
  const photoPlaceholder = document.getElementById('artist-placeholder');
  if (photoPlaceholder) {
    photoPlaceholder.style.backgroundColor = placeholderColor;
    photoPlaceholder.style.width = '150px';
    photoPlaceholder.style.height = '150px';
    photoPlaceholder.style.borderRadius = '8px';
    carregarImagemSpotify(artista.nome, photoPlaceholder);
  }

  const nameElement = document.getElementById('artist-name-big');
  if (nameElement) {
    nameElement.textContent = artista.nome;
  }

  const statPopularity = document.getElementById('stat-popularity');
  if (statPopularity) {
    statPopularity.textContent = artista.popularity;
  }

  const statLikes = document.getElementById('stat-likes');
  if (statLikes) {
    statLikes.textContent = formatNumber(artista.likes);
  }

  const statViews = document.getElementById('stat-views');
  if (statViews) {
    statViews.textContent = formatNumber(artista.views);
  }

  const statGenre = document.getElementById('stat-genre');
  if (statGenre) {
    const genre = artista.genre.split(',')[0].trim();
    statGenre.textContent = genre;
  }

  const statFollowers = document.getElementById('stat-followers');
  if (statFollowers) {
    statFollowers.textContent = formatNumber(artista.followers);
  }
}

function renderRadarChart(audioFeatures) {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;

  if (window.radarChartInstance) {
    window.radarChartInstance.destroy();
  }

  const normalizedLoudness = Math.max(0, Math.min(100, (audioFeatures.loudness || 0) + 60));

  window.radarChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Energy', 'Danceability', 'Valence', 'Loudness', 'Speechiness', 'Instrumentalness'],
      datasets: [
        {
          data: [
            (audioFeatures.energy || 0) * 100,
            (audioFeatures.danceability || 0) * 100,
            (audioFeatures.valence || 0) * 100,
            normalizedLoudness,
            (audioFeatures.speechiness || 0) * 100,
            (audioFeatures.instrumentalness || 0) * 100
          ],
          backgroundColor: 'rgba(168, 85, 247, 0.15)',
          borderColor: '#A855F7',
          borderWidth: 2,
          pointBackgroundColor: '#A855F7',
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Analise de Audio - ' + (artistData ? artistData.nome : '')
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, stepSize: 25 },
          pointLabels: { font: { size: 10 }, color: '#888' },
          grid: { color: 'rgba(168, 85, 247, 0.15)' },
          angleLines: { color: 'rgba(168, 85, 247, 0.15)' },
        },
      },
    },
  });
}

function formatNumber(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}

function getPlaceholderColor(artistId) {
  const cores = [
    '#A855F7', '#D421BF', '#EC4899', '#06B6D4',
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'
  ];
  return cores[artistId % cores.length];
}

function showError(message) {
  const container = document.querySelector('.artist-body');
  if (container) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">' + message + '</p>';
  }
}

function renderMusicCards(musicas) {
  const container = document.getElementById('ranking-body');
  if (!container) return;

  if (musicas.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Este artista nao tem musicas registradas.</p>';
    return;
  }

  musicas.sort(function (a, b) {
    return b.popularity - a.popularity;
  });

  let html = '';
  musicas.forEach(function (musica, index) {
    const position = index + 1;
    const placeholderColor = getPlaceholderColor(musica.id);

    var nomeArtista = artistData ? artistData.nome : '';
    html += `
      <div class="card">
        <div class="left-content-group">
          <span class="ranking-number">${position}o</span>
          <div class="spotify-artist-img" data-artist-name="${nomeArtista.replace(/"/g, '&quot;')}" style="width: 65px; height: 65px;
                      background-color: ${placeholderColor};
                      border-radius: 8px;
                      flex-shrink: 0;">
          </div>
          <div class="artist-info-header">
            <span class="artist-name">${musica.track}</span>
            <span class="genre">Popularity: ${musica.popularity}</span>
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
          <button class="details-button" data-musica-id="${musica.id}">Detalhes da musica</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
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

function colorRankingNumbers() {
  const rankings = document.querySelectorAll('.ranking-number');
  const cores = {
    '1o': '#D4AF37',
    '2o': '#A8A9AD',
    '3o': '#CD7F32',
  };

  rankings.forEach(function (el) {
    const cor = cores[el.textContent.trim()];
    el.style.color = cor || '#000000';
  });
}

function attachEventListeners() {
  const btnSetlist = document.querySelector('.btn-setlist');
  if (btnSetlist) {
    btnSetlist.addEventListener('click', function () {
      if (currentArtistId) {
        adicionarALineup(currentArtistId, artistData ? artistData.nome : null);
      }
    });
  }

  document.getElementById('ranking-body').addEventListener('click', function (e) {
    if (e.target.classList.contains('details-button')) {
      const musicaId = e.target.getAttribute('data-musica-id');
      if (musicaId) {
        window.location.href = 'analisarMusica.html?id=' + musicaId;
      }
    }
  });
}
