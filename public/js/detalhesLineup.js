var lineupId = null;
var lineupData = null;
var artistas = [];
var artistasFiltrados = [];
var radarChart = null;

var CORES_POSICAO = ['#D4AF37', '#A8A9AD', '#CD7F32'];

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    lineupId = obterIdDaURL();
    if (!lineupId) {
        document.getElementById('lineup-nome').textContent = 'ID inválido';
        return;
    }
    carregarLineup();
});

function obterIdDaURL() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    return id ? parseInt(id) : null;
}

async function carregarLineup() {
    try {
        var response = await fetch('http://localhost:3333/lineups/' + lineupId);
        if (!response.ok) throw new Error('Erro ' + response.status);
        lineupData = await response.json();
        artistas = lineupData.artistas || [];
        artistasFiltrados = artistas.slice();
        renderizarCabecalho();
        renderizarArtistas();
        renderizarGraficoRadar();
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

        html +=
            '<div class="artist-card">' +
                '<div class="left-content-group">' +
                    '<span class="ranking-number" style="color:' + cor + '">' + posicao + '</span>' +
                    '<div style="width:52px;height:52px;background:' + cor + ';border-radius:8px;flex-shrink:0;"></div>' +
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
}

function colorirPosicoes() {
    var rankings = document.querySelectorAll('.ranking-number');
    rankings.forEach(function (el, idx) {
        var cor = CORES_POSICAO[idx] || '#A855F7';
        if (idx >= 3) {
            el.style.color = '#1A0A2E';
        } else {
            el.style.color = cor;
        }
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
    fetch('http://localhost:3333/artistas/ranking')
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
        fetch('http://localhost:3333/artistas/search?q=' + encodeURIComponent(termo))
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
        var response = await fetch('http://localhost:3333/lineups/' + lineupId + '/artistas', {
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
        var response = await fetch('http://localhost:3333/lineups/' + lineupId + '/artistas/' + artistaId, {
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

    var labels = ['Popularidade', 'Energia', 'Dançabilidade', 'Valência', 'Volume', 'Instrumentalidade'];
    var dados = [50, 50, 50, 50, 50, 50];

    if (artistas.length > 0) {
        var mediaPop = artistas.reduce(function (s, a) { return s + (a.popularity || 0); }, 0) / artistas.length;
        dados[0] = Math.round(mediaPop);
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
