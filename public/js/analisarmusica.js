let currentMusicId = null;
let musicData = null;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    validarSessao();

    currentMusicId = getMusicIdFromURL();

    if (!currentMusicId) {
      showError('ID da musica nao fornecido na URL');
      return;
    }

    await fetchMusicDetails(currentMusicId);

    if (!musicData) {
      showError('Musica nao encontrada');
      return;
    }

    renderMusicCard(musicData);
    renderRadarChart(musicData);
    renderMoodValues(musicData);

    setupCompararButton();

  } catch (error) {
    console.error('Erro durante inicializacao:', error);
    showError('Erro ao carregar dados da musica');
  }
});

function setupCompararButton() {
  var btn = document.querySelector('.btn-comparar');
  if (btn) {
    btn.addEventListener('click', function () {
      window.location.href = 'compararmusicas.html?id=' + currentMusicId;
    });
  }

  var btnPlaylist = document.querySelector('.btn-playlist');
  if (btnPlaylist) {
    btnPlaylist.addEventListener('click', function () {
      if (currentMusicId) {
        adicionarASetlist(currentMusicId, musicData ? musicData.track : null);
      }
    });
  }
}

function getMusicIdFromURL() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');
  return id ? parseInt(id) : null;
}

async function fetchMusicDetails(musicId) {
  try {
    var response = await fetch('http://localhost:3333/musicas/' + musicId + '/detalhes');
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Erro na API: ' + response.status);
    }
    musicData = await response.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes da musica:', error);
    throw error;
  }
}

function renderMusicCard(musica) {
  var placeholderColor = getPlaceholderColor(musica.id);

  var photoElement = document.getElementById('music-photo');
  if (photoElement) {
    photoElement.style.backgroundColor = placeholderColor;
    photoElement.style.width = '130px';
    photoElement.style.height = '130px';
    photoElement.style.borderRadius = '10px';
    photoElement.style.flexShrink = '0';
    photoElement.classList.add('spotify-artist-img');
    photoElement.setAttribute('data-artist-name', musica.artist || '');
    if (musica.artist) carregarImagemSpotify(musica.artist, photoElement);
  }

  var titleElement = document.getElementById('music-title');
  if (titleElement) {
    titleElement.textContent = musica.track;
  }

  var artistElement = document.getElementById('music-artist');
  if (artistElement) {
    artistElement.textContent = musica.artist;
  }

  var genreElement = document.getElementById('meta-genre');
  if (genreElement && musica.genre) {
    var firstGenre = musica.genre.split(',')[0].trim();
    genreElement.textContent = firstGenre;
  }

  var statLikes = document.getElementById('stat-likes');
  if (statLikes) {
    statLikes.textContent = formatarNumero(musica.likes);
  }

  var statViews = document.getElementById('stat-views');
  if (statViews) {
    statViews.textContent = formatarNumero(musica.views);
  }

  var statComments = document.getElementById('stat-comments');
  if (statComments) {
    statComments.textContent = formatarNumero(musica.comments);
  }

  var statStreams = document.getElementById('stat-streams');
  if (statStreams) {
    statStreams.textContent = formatarNumero(musica.streams);
  }
}

function renderRadarChart(musica) {
  var ctx = document.getElementById('radarChart');
  if (!ctx) return;

  var features = {
    energy: (parseFloat(musica.energy) || 0) * 100,
    danceability: (parseFloat(musica.danceability) || 0) * 100,
    valence: (parseFloat(musica.valence) || 0) * 100,
    loudness: Math.max(0, Math.min(100, (parseFloat(musica.loudness) || 0) + 60)),
    speechiness: (parseFloat(musica.speechiness) || 0) * 100,
    instrumentalness: (parseFloat(musica.instrumentalness) || 0) * 100
  };

  new Chart(ctx.getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['Energy', 'Danceability', 'Valence', 'Loudness', 'Speechiness', 'Instrumentalness'],
      datasets: [
        {
          data: [
            features.energy,
            features.danceability,
            features.valence,
            features.loudness,
            features.speechiness,
            features.instrumentalness
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
          text: 'Perfil musical - ' + musica.track
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, stepSize: 25 },
          pointLabels: { font: { size: 9 }, color: '#888' },
          grid: { color: 'rgba(168, 85, 247, 0.15)' },
          angleLines: { color: 'rgba(168, 85, 247, 0.15)' },
        },
      },
    },
  });
}

function renderMoodValues(musica) {
  var energy = parseFloat(musica.energy) || 0;
  var valence = parseFloat(musica.valence) || 0;
  var danceability = parseFloat(musica.danceability) || 0;

  var moods = {
    feliz: Math.round(valence * 100),
    neutro: Math.round(((energy + danceability + valence) / 3) * 100),
    triste: Math.round((1 - valence) * 100),
    energetico: Math.round(energy * 100),
    relax: Math.round((1 - energy) * 100)
  };

  var moodFeliz = document.getElementById('mood-feliz');
  if (moodFeliz) moodFeliz.textContent = moods.feliz + '%';

  var moodNeutro = document.getElementById('mood-neutro');
  if (moodNeutro) moodNeutro.textContent = moods.neutro + '%';

  var moodTriste = document.getElementById('mood-triste');
  if (moodTriste) moodTriste.textContent = moods.triste + '%';

  var moodEnergetico = document.getElementById('mood-energetico');
  if (moodEnergetico) moodEnergetico.textContent = moods.energetico + '%';

  var moodRelax = document.getElementById('mood-relax');
  if (moodRelax) moodRelax.textContent = moods.relax + '%';
}

function showError(message) {
  var container = document.querySelector('.artist-body');
  if (container) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">' + message + '</p>';
  }
}
