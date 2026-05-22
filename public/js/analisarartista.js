let currentArtistId = null;
let allMusics = [];
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

    await fetchArtistData(currentArtistId);
    
    if (!artistData) {
      showError('Artista nao encontrado');
      return;
    }

    await fetchAllMusics();

    renderArtistProfile(artistData);

    const audioFeatures = calculateAudioFeatures(currentArtistId);
    renderRadarChart(audioFeatures);

    renderMusicsSection(currentArtistId);

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

async function fetchArtistData(artistId) {
  try {
    const response = await fetch('http://localhost:3333/artistas/listar');
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const artistas = await response.json();
    artistData = artistas.find(a => a.id_artista === artistId);
    
    if (!artistData) {
      console.warn(`Artista com ID ${artistId} nao encontrado`);
    }
  } catch (error) {
    console.error('Erro ao buscar dados do artista:', error);
    throw error;
  }
}

async function fetchAllMusics() {
  try {
    const response = await fetch('http://localhost:3333/musicas/listar');
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    allMusics = await response.json();
  } catch (error) {
    console.error('Erro ao buscar musicas:', error);
    throw error;
  }
}

function renderArtistProfile(artista) {
  const placeholderColor = getPlaceholderColor(artista.id_artista);
  const photoPlaceholder = document.getElementById('artist-placeholder');
  if (photoPlaceholder) {
    photoPlaceholder.style.backgroundColor = placeholderColor;
    photoPlaceholder.style.width = '150px';
    photoPlaceholder.style.height = '150px';
    photoPlaceholder.style.borderRadius = '8px';
  }

  const nameElement = document.getElementById('artist-name-big');
  if (nameElement) {
    nameElement.textContent = artista.nome;
  }

  const statPopularity = document.getElementById('stat-popularity');
  if (statPopularity) {
    statPopularity.textContent = artista.artist_popularity;
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
    const genre = artista.artist_genre.split(',')[0].trim();
    statGenre.textContent = genre;
  }

  const statFollowers = document.getElementById('stat-followers');
  if (statFollowers) {
    statFollowers.textContent = formatNumber(artista.artist_followers);
  }
}

function calculateAudioFeatures(artistId) {
  const artistMusics = allMusics.filter(m => m.fk_artista === artistId);
  
  if (artistMusics.length === 0) {
    return {
      energy: 0,
      danceability: 0,
      valence: 0,
      loudness: 0,
      speechiness: 0,
      instrumentalness: 0
    };
  }

  const calculateAverage = (field) => {
    const sum = artistMusics.reduce((acc, music) => {
      const value = parseFloat(music[field]) || 0;
      return acc + value;
    }, 0);
    return parseFloat((sum / artistMusics.length).toFixed(2));
  };

  return {
    energy: calculateAverage('energy') * 100,
    danceability: calculateAverage('danceability') * 100,
    valence: calculateAverage('valence') * 100,
    loudness: calculateAverage('loudness'),
    speechiness: calculateAverage('speechiness') * 100,
    instrumentalness: calculateAverage('instrumentalness') * 100
  };
}

function renderRadarChart(audioFeatures) {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;

  if (window.radarChartInstance) {
    window.radarChartInstance.destroy();
  }

  const normalizedLoudness = Math.max(0, Math.min(100, audioFeatures.loudness + 60));

  window.radarChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Energy', 'Danceability', 'Valence', 'Loudness', 'Speechiness', 'Instrumentalness'],
      datasets: [
        {
          data: [
            audioFeatures.energy,
            audioFeatures.danceability,
            audioFeatures.valence,
            normalizedLoudness,
            audioFeatures.speechiness,
            audioFeatures.instrumentalness
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
          text: `An{lise de Audio - ${artistData.nome}`
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
    container.innerHTML = `<p style="text-align: center; padding: 40px; color: #999;">${message}</p>`;
  }
}

function renderMusicsSection(artistId) {
  artistMusics = allMusics.filter(m => m.fk_artista === artistId);
  
  artistMusics.sort((a, b) => b.track_popularity - a.track_popularity);
  
  renderMusicCards(artistMusics);
}

function renderMusicCards(musicas) {
  const container = document.getElementById('ranking-body');
  if (!container) return;
  
  if (musicas.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">Este artista nao tem musicas registradas.</p>';
    return;
  }
  
  let html = '';
  musicas.forEach((musica, index) => {
    const position = index + 1;
    const placeholderColor = getPlaceholderColor(musica.id_musica);
    
    html += `
      <div class="card">
        <div class="left-content-group">
          <span class="ranking-number">${position}o</span>
          <div style="width: 65px; height: 65px; 
                      background-color: ${placeholderColor}; 
                      border-radius: 8px;
                      flex-shrink: 0;">
          </div>
          <div class="artist-info-header">
            <span class="artist-name">${musica.track}</span>
            <span class="genre">Popularity: ${musica.track_popularity}</span>
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
          <button class="details-button" data-musica-id="${musica.id_musica}">Detalhes da musica</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  colorRankingNumbers();
}

function colorRankingNumbers() {
  const rankings = document.querySelectorAll('.ranking-number');
  const cores = {
    '1o': '#D4AF37',
    '2o': '#A8A9AD',
    '3o': '#CD7F32',
  };

  rankings.forEach((el) => {
    const cor = cores[el.textContent.trim()];
    el.style.color = cor || '#000000';
  });
}

function attachEventListeners() {
  const btnSetlist = document.querySelector('.btn-setlist');
  if (btnSetlist) {
    btnSetlist.addEventListener('click', () => {
      alert('Funcionalidade de adicionar a lineup sera implementada em breve');
    });
  }
  
  document.getElementById('ranking-body').addEventListener('click', (e) => {
    if (e.target.classList.contains('details-button')) {
      const musicaId = e.target.getAttribute('data-musica-id');
      if (musicaId) {
        alert(`Detalhes da musica ${musicaId} - em desenvolvimento`);
      }
    }
  });
}