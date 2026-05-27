var playlistId = null;
var playlistData = null;
var musicas = [];
var musicasFiltrados = [];
var radarChart = null;
var todasMusicas = [];
var todasMusicasFiltradas = [];

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    playlistId = obterIdDaURL();
    if (!playlistId) {
        document.getElementById('playlist-nome').textContent = 'ID inválido';
        return;
    }
    carregarPlaylist();
});

async function carregarPlaylist() {
    try {
        var response = await fetch('/setlists/' + playlistId);
        if (!response.ok) throw new Error('Erro ' + response.status);
        playlistData = await response.json();
        musicas = playlistData.musicas || [];
        musicasFiltrados = musicas.slice();
        renderizarCabecalho();
        renderizarMusicas();
        renderizarGraficoRadar();
        renderizarMediaBarras();
    } catch (e) {
        console.error('Erro ao carregar playlist:', e);
        document.getElementById('playlist-nome').textContent = 'Erro ao carregar';
        document.getElementById('playlist-music-list').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Erro ao carregar playlist.</p>';
    }
}

function renderizarCabecalho() {
    document.getElementById('playlist-nome').textContent = playlistData.nome || 'Playlist';
    var statusEl = document.getElementById('playlist-status');
    if (statusEl && playlistData.situacao) {
        var statusClass = playlistData.situacao === 'realizado' ? 'status-realizado' : 'status-pendente';
        var statusIcon = playlistData.situacao === 'realizado' ? 'check_circle' : 'schedule';
        statusEl.style.display = 'block';
        statusEl.innerHTML =
            '<span class="' + statusClass + '">' +
                '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">' + statusIcon + '</span> ' +
                playlistData.situacao +
            '</span>' +
            '<span style="color:#999;font-size:12px;margin-left:12px;">' + (playlistData.data_evento || '') + '</span>';
    }
}

function renderizarMusicas() {
    var container = document.getElementById('playlist-music-list');
    if (!container) return;

    if (musicasFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Nenhuma música nesta playlist.</p>';
        return;
    }

    var html = '';
    musicasFiltrados.forEach(function (musica, index) {
        var posicao = (index + 1) + 'º';
        var cor = CORES_POSICAO[index] || '#A855F7';
        var genre = musica.genre || 'Desconhecido';
        var genero = genre.split(',')[0].trim();

        var nomeArtista = musica.artista_nome || '';
        var nomeArtistaEscaped = nomeArtista.replace(/"/g, '&quot;');
        html +=
            '<div class="artist-card">' +
                '<div class="left-content-group">' +
                    '<span class="ranking-number" style="color:' + cor + '">' + posicao + '</span>' +
                    '<div class="spotify-artist-img" data-artist-name="' + nomeArtistaEscaped + '" style="width:52px;height:52px;background:' + cor + ';border-radius:8px;flex-shrink:0;"></div>' +
                    '<div class="artist-info-header">' +
                        '<span class="artist-name">' + (musica.track || 'Desconhecida') + '</span>' +
                        '<span class="genre">' + (musica.artista_nome || 'Artista desconhecido') + ' · ' + genero + '</span>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-remover" data-musica-id="' + musica.id + '">Remover música</button>' +
                '<ul>' +
                    '<li>' +
                        '<span class="artist-atribute">Popularidade</span>' +
                        '<span class="atribute-value">' + (musica.popularity || '--') + '</span>' +
                    '</li>' +
                    '<li>' +
                        '<span class="artist-atribute">Streams</span>' +
                        '<span class="atribute-value">' + formatarNumero(musica.streams) + '</span>' +
                    '</li>' +
                '</ul>' +
            '</div>';
    });

    container.innerHTML = html;
    colorirPosicoes();
    carregarImagensArtistas();
}

function carregarImagensArtistas() {
    var elementos = document.querySelectorAll('.spotify-artist-img');
    elementos.forEach(function (el) {
        var nome = el.getAttribute('data-artist-name');
        if (nome) carregarImagemSpotify(nome, el);
    });
}

function filtrarMusicas() {
    var termo = document.getElementById('input-busca-musica').value.toLowerCase();
    musicasFiltrados = musicas.filter(function (m) {
        return (m.track && m.track.toLowerCase().includes(termo)) ||
               (m.artista_nome && m.artista_nome.toLowerCase().includes(termo));
    });
    renderizarMusicas();
}

function abrirModalAdicionarMusica() {
    var modal = document.getElementById('modal-adicionar-musica');
    modal.style.display = 'flex';
    document.getElementById('input-busca-musica-modal').value = '';
    document.getElementById('resultado-busca-musica').innerHTML = '<p style="color:#999;font-size:13px;padding:8px;">Carregando músicas...</p>';
    document.getElementById('input-busca-musica-modal').focus();

    fetch('/musicas/top?limit=10000')
        .then(function (r) { return r.json(); })
        .then(function (dados) {
            todasMusicas = dados || [];
            todasMusicasFiltradas = todasMusicas.slice();
            renderizarResultadoBusca(todasMusicasFiltradas);
        })
        .catch(function (e) {
            console.error('Erro ao carregar músicas:', e);
            document.getElementById('resultado-busca-musica').innerHTML =
                '<p style="color:#999;font-size:13px;padding:8px;">Erro ao carregar músicas.</p>';
        });
}

function fecharModalAdicionarMusica() {
    document.getElementById('modal-adicionar-musica').style.display = 'none';
}

function renderizarResultadoBusca(lista) {
    var container = document.getElementById('resultado-busca-musica');
    if (!container) return;

    var jaNaPlaylist = {};
    musicas.forEach(function (m) { jaNaPlaylist[m.id] = true; });

    if (!lista || lista.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:13px;padding:8px;">Nenhuma música encontrada.</p>';
        return;
    }

    var html = '';
    lista.forEach(function (musica) {
        var jaAdicionado = jaNaPlaylist[musica.id];
        html +=
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border:1px solid #e0d5f2;border-radius:8px;">' +
                '<div style="display:flex;flex-direction:column;">' +
                    '<span style="font-size:13px;font-weight:600;color:#1A0A2E;">' + (musica.track || 'Desconhecida') + '</span>' +
                    '<span style="font-size:11px;color:#999;">' + (musica.artist || musica.artista_nome || '') + '</span>' +
                '</div>' +
                (jaAdicionado
                    ? '<span style="font-size:11px;color:#999;">Já adicionada</span>'
                    : '<button class="btn-confirmar" style="padding:4px 12px;font-size:11px;" onclick="adicionarMusicaNaPlaylist(' + musica.id + ')">Adicionar</button>'
                ) +
            '</div>';
    });
    container.innerHTML = html;
}

function buscarMusicaModal() {
    var termo = document.getElementById('input-busca-musica-modal').value.trim().toLowerCase();

    if (!termo) {
        todasMusicasFiltradas = todasMusicas.slice();
    } else {
        todasMusicasFiltradas = todasMusicas.filter(function (m) {
            var nomeArtista = m.artist || m.artista_nome || '';
            return (m.track && m.track.toLowerCase().includes(termo)) ||
                   (nomeArtista.toLowerCase().includes(termo));
        });
    }
    renderizarResultadoBusca(todasMusicasFiltradas);
}

async function adicionarMusicaNaPlaylist(musicaId) {
    try {
        var response = await fetch('/setlists/' + playlistId + '/musicas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ musicaId: musicaId })
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        fecharModalAdicionarMusica();
        await carregarPlaylist();
    } catch (e) {
        console.error('Erro ao adicionar música:', e);
        alert('Erro ao adicionar música. Tente novamente.');
    }
}

document.addEventListener('click', function (e) {
    var btnRemover = e.target.closest('.btn-remover');
    if (btnRemover && btnRemover.getAttribute('data-musica-id')) {
        var musicaId = parseInt(btnRemover.getAttribute('data-musica-id'));
        removerMusicaDaPlaylist(musicaId);
    }
});

async function removerMusicaDaPlaylist(musicaId) {
    if (!confirm('Remover esta música da playlist?')) return;

    try {
        var response = await fetch('/setlists/' + playlistId + '/musicas/' + musicaId, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        await carregarPlaylist();
    } catch (e) {
        console.error('Erro ao remover música:', e);
        alert('Erro ao remover música. Tente novamente.');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        fecharModalAdicionarMusica();
    }
});

function renderizarGraficoRadar() {
    var ctx = document.getElementById('radarChart');
    if (!ctx) return;

    var labels = ['Energia', 'Dançabilidade', 'Valência', 'Volume', 'Fala', 'Instrumentalidade'];
    var dados = [50, 50, 50, 50, 50, 50];

    if (musicas.length > 0) {
        var energy = musicas.reduce(function (s, m) { return s + (parseFloat(m.energy) || 0); }, 0) / musicas.length;
        var dance = musicas.reduce(function (s, m) { return s + (parseFloat(m.danceability) || 0); }, 0) / musicas.length;
        var valence = musicas.reduce(function (s, m) { return s + (parseFloat(m.valence) || 0); }, 0) / musicas.length;
        var loudness = musicas.reduce(function (s, m) { return s + ((parseFloat(m.loudness) || -60) + 60); }, 0) / musicas.length;
        var speech = musicas.reduce(function (s, m) { return s + (parseFloat(m.speechiness) || 0); }, 0) / musicas.length;
        var instrumental = musicas.reduce(function (s, m) { return s + (parseFloat(m.instrumentalness) || 0); }, 0) / musicas.length;

        dados = [
            Math.round(energy * 100),
            Math.round(dance * 100),
            Math.round(valence * 100),
            Math.min(100, Math.max(0, Math.round(loudness))),
            Math.round(speech * 100),
            Math.round(instrumental * 100)
        ];
    }

    if (radarChart) radarChart.destroy();
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                borderColor: '#A855F7',
                borderWidth: 2,
                pointBackgroundColor: '#A855F7',
                pointRadius: 3,
            }],
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
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

function renderizarMediaBarras() {
    var container = document.getElementById('media-playlist');
    if (!container) return;

    if (musicas.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:13px;">Adicione músicas para ver a média.</p>';
        return;
    }

    var energy = musicas.reduce(function (s, m) { return s + (parseFloat(m.energy) || 0); }, 0) / musicas.length;
    var dance = musicas.reduce(function (s, m) { return s + (parseFloat(m.danceability) || 0); }, 0) / musicas.length;
    var valence = musicas.reduce(function (s, m) { return s + (parseFloat(m.valence) || 0); }, 0) / musicas.length;
    var loudnessNorm = musicas.reduce(function (s, m) { return s + ((parseFloat(m.loudness) || -60) + 60); }, 0) / musicas.length;
    var speech = musicas.reduce(function (s, m) { return s + (parseFloat(m.speechiness) || 0); }, 0) / musicas.length;
    var instrumental = musicas.reduce(function (s, m) { return s + (parseFloat(m.instrumentalness) || 0); }, 0) / musicas.length;

    var barras = [
        { label: 'Energia', value: energy },
        { label: 'Dançab.', value: dance },
        { label: 'Valência', value: valence },
        { label: 'Volume', value: Math.min(1, Math.max(0, loudnessNorm / 100)) },
        { label: 'Fala', value: speech },
        { label: 'Instrum.', value: instrumental }
    ];

    var html = '';
    barras.forEach(function (barra) {
        var pct = Math.round(barra.value * 100);
        html +=
            '<div class="genre-row">' +
                '<span class="genre-label">' + barra.label + '</span>' +
                '<div class="genre-bar-track">' +
                    '<div class="genre-bar" style="width: ' + pct + '%"></div>' +
                '</div>' +
                '<span class="genre-qty">' + pct + '%</span>' +
            '</div>';
    });

    container.innerHTML = html;
}
