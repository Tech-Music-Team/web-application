var lineupId = null;
var lineupData = null;
var artistas = [];
var artistasFiltrados = [];
var radarChart = null;

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    lineupId = obterIdDaURL();
    if (!lineupId) {
        document.getElementById('lineup-nome').textContent = 'ID inválido';
        return;
    }
    carregarLineup();
});

async function carregarLineup() {
    try {
        var response = await fetch('/lineups/' + lineupId);
        if (!response.ok) throw new Error('Erro ' + response.status);
        lineupData = await response.json();
        artistas = lineupData.artistas || [];
        artistasFiltrados = artistas.slice();

        await Promise.all(artistas.map(function (a) {
            return fetch('/artistas/' + a.id + '/features')
                .then(function (r) { return r.json(); })
                .then(function (f) { a.audioFeatures = f; })
                .catch(function () { a.audioFeatures = null; });
        }));

        renderizarCabecalho();
        renderizarArtistas();
        renderizarGraficoRadar();
        renderizarMediaLineup();
    } catch (e) {
        console.error('Erro ao carregar lineup:', e);
        document.getElementById('lineup-nome').textContent = 'Erro ao carregar';
        document.getElementById('lineup-artist-list').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Erro ao carregar lineup.</p>';
    }
}

function renderizarCabecalho() {
    document.getElementById('lineup-nome').textContent = lineupData.nome;

    var dataEl = document.getElementById('lineup-data');
    dataEl.textContent = lineupData.data_evento || '--';

    var statusEl = document.getElementById('lineup-status');
    var statusText = document.getElementById('lineup-status-text');
    var dot = statusEl.querySelector('.status-dot');

    if (lineupData.status === 'realizado') {
        statusEl.style.color = '#16a34a';
        statusText.textContent = 'Realizado';
        dot.style.backgroundColor = '#22c55e';
    } else {
        statusEl.style.color = '#ca8a04';
        statusText.textContent = 'Pendente';
        dot.style.backgroundColor = '#eab308';
    }
}

function renderizarArtistas() {
    var container = document.getElementById('lineup-artist-list');
    if (!container) return;

    if (artistasFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Nenhum artista nesta lineup.</p>';
        return;
    }

    var html = '';
    artistasFiltrados.forEach(function (artista, index) {
        var posicao = (index + 1) + 'º';
        var cor = CORES_POSICAO[index] || '#A855F7';
        var popularidade = artista.popularity || '--';

        var nomeEscaped = artista.nome.replace(/"/g, '&quot;');
        html +=
            '<div class="artist-card">' +
                '<div class="left-content-group">' +
                    '<span class="ranking-number" style="color:' + cor + '">' + posicao + '</span>' +
                    '<div class="spotify-artist-img" data-artist-name="' + nomeEscaped + '" style="width:52px;height:52px;background:' + cor + ';border-radius:8px;flex-shrink:0;"></div>' +
                    '<div class="artist-info-header">' +
                        '<span class="artist-name">' + artista.nome + '</span>' +
                        '<span class="genre">' + (artista.genre || 'Gênero: --') + '</span>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-remover" data-artista-id="' + artista.id + '">Remover artista</button>' +
                '<ul>' +
                    '<li>' +
                        '<span class="artist-atribute">Popularidade</span>' +
                        '<span class="atribute-value">' + popularidade + '</span>' +
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

function filtrarArtistas() {
    var termo = document.getElementById('input-busca-artista').value.toLowerCase();
    artistasFiltrados = artistas.filter(function (a) {
        return a.nome.toLowerCase().includes(termo);
    });
    renderizarArtistas();
}

function abrirModalAdicionarArtista() {
    document.getElementById('modal-adicionar-artista').style.display = 'flex';
    document.getElementById('input-busca-artista-modal').value = '';
    document.getElementById('input-busca-artista-modal').focus();
    carregarRankingModal();
}

function fecharModalAdicionarArtista() {
    document.getElementById('modal-adicionar-artista').style.display = 'none';
}

function carregarRankingModal() {
    fetch('/artistas/ranking')
        .then(function (r) { return r.json(); })
        .then(function (resultados) {
            renderizarListaModal(resultados);
        })
        .catch(function (e) {
            console.error('Erro ao carregar ranking:', e);
        });
}

var timeoutBusca = null;

function buscarArtistaModal() {
    clearTimeout(timeoutBusca);
    var termo = document.getElementById('input-busca-artista-modal').value.trim();
    if (termo.length < 2) {
        carregarRankingModal();
        return;
    }

    timeoutBusca = setTimeout(function () {
        fetch('/artistas/search?q=' + encodeURIComponent(termo))
            .then(function (r) { return r.json(); })
            .then(function (resultados) {
                renderizarListaModal(resultados);
            })
            .catch(function (e) {
                console.error('Erro ao buscar artistas:', e);
            });
    }, 300);
}

function renderizarListaModal(resultados) {
    var container = document.getElementById('resultado-busca-artista');
    if (!resultados || resultados.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:13px;padding:8px;">Nenhum artista encontrado.</p>';
        return;
    }

    var jaNaLineup = {};
    artistas.forEach(function (a) { jaNaLineup[a.id] = true; });

    var html = '';
    resultados.forEach(function (artista) {
        var jaAdicionado = jaNaLineup[artista.id];
        html +=
            '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border:1px solid #e0d5f2;border-radius:8px;">' +
                '<span style="font-size:13px;font-weight:600;color:#1A0A2E;">' + artista.nome + '</span>' +
                (jaAdicionado
                    ? '<span style="font-size:11px;color:#999;">Já adicionado</span>'
                    : '<button class="btn-confirmar" style="padding:4px 12px;font-size:11px;" onclick="adicionarArtistaNaLineup(' + artista.id + ')">Adicionar</button>'
                ) +
            '</div>';
    });
    container.innerHTML = html;
}

async function adicionarArtistaNaLineup(artistaId) {
    try {
        var response = await fetch('/lineups/' + lineupId + '/artistas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artistaId: artistaId })
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        fecharModalAdicionarArtista();
        await carregarLineup();
    } catch (e) {
        console.error('Erro ao adicionar artista:', e);
        alert('Erro ao adicionar artista. Tente novamente.');
    }
}

document.addEventListener('click', function (e) {
    var btnRemover = e.target.closest('.btn-remover');
    if (btnRemover && btnRemover.getAttribute('data-artista-id')) {
        var artistaId = parseInt(btnRemover.getAttribute('data-artista-id'));
        removerArtistaDaLineup(artistaId);
    }
});

async function removerArtistaDaLineup(artistaId) {
    if (!confirm('Remover este artista da lineup?')) return;

    try {
        var response = await fetch('/lineups/' + lineupId + '/artistas/' + artistaId, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        await carregarLineup();
    } catch (e) {
        console.error('Erro ao remover artista:', e);
        alert('Erro ao remover artista. Tente novamente.');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        fecharModalAdicionarArtista();
    }
});

function renderizarGraficoRadar() {
    var ctx = document.getElementById('radarChart');
    if (!ctx) return;

    var labels = ['Energia', 'Dançabilidade', 'Valência', 'Volume', 'Fala', 'Instrumentalidade'];
    var dados = [50, 50, 50, 50, 50, 50];

    var f = lineupData.features;
    if (f) {
        dados = [
            Math.round((f.energy || 0) * 100),
            Math.round((f.danceability || 0) * 100),
            Math.round((f.valence || 0) * 100),
            Math.min(100, Math.max(0, Math.round((f.loudness || -60) + 60))),
            Math.round((f.speechiness || 0) * 100),
            Math.round((f.instrumentalness || 0) * 100),
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

function renderizarMediaLineup() {
    var container = document.getElementById('media-lineup');
    if (!container) return;

    var f = lineupData.features;
    if (!f || artistas.length === 0) {
        container.innerHTML = '<p style="color:#999;font-size:13px;">Adicione artistas para ver a m\u00E9dia.</p>';
        return;
    }

    var energy = parseFloat(f.energy) || 0;
    var dance = parseFloat(f.danceability) || 0;
    var valence = parseFloat(f.valence) || 0;
    var loudnessNorm = Math.min(1, Math.max(0, ((parseFloat(f.loudness) || -60) + 60) / 100));
    var speech = parseFloat(f.speechiness) || 0;
    var instrumental = parseFloat(f.instrumentalness) || 0;

    var barras = [
        { label: 'Energia', value: energy },
        { label: 'Dan\u00E7ab.', value: dance },
        { label: 'Val\u00EAncia', value: valence },
        { label: 'Volume', value: loudnessNorm },
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
