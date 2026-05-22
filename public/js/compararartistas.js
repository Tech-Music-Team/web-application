var estado = { 1: null, 2: null };
var audioEstado = { 1: null, 2: null };
var slotAtivo = null;
var listaArtistas = [];
var radarChart = null;

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    attachEventListeners();
});

function attachEventListeners() {
    document.getElementById('input-busca').addEventListener('input', filtrarLista);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharModal();
    });

    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            document.querySelectorAll('.painel-aba').forEach(function (p) { p.style.display = 'none'; });
            document.getElementById('painel-' + this.dataset.painel).style.display = 'block';
        });
    });
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

async function abrirSeletor(slot) {
    slotAtivo = slot;
    document.getElementById('input-busca').value = '';

    if (listaArtistas.length === 0) {
        try {
            var response = await fetch('http://localhost:3333/artistas/ranking?limit=1000');
            if (!response.ok) throw new Error('Erro ' + response.status);
            listaArtistas = await response.json();
        } catch (e) {
            console.error('Erro ao carregar artistas:', e);
            return;
        }
    }

    renderModalLista(listaArtistas);
    document.getElementById('modal-fundo').style.display = 'flex';
}

function renderModalLista(lista) {
    var container = document.getElementById('lista-selecao');
    container.innerHTML = '';
    var coresPosicao = ['#D4AF37', '#A8A9AD', '#CD7F32'];

    lista.forEach(function (artista, i) {
        var item = document.createElement('div');
        item.className = 'item-selecao';
        var cor = coresPosicao[i] || '#A855F7';
        var primeiroGenero = artista.genre ? artista.genre.split(',')[0].trim() : 'Desconhecido';

        item.innerHTML =
            '<span class="item-pos" style="color:' + cor + '">' + (i + 1) + 'º</span>' +
            '<span class="item-nome">' + artista.nome + '</span>' +
            '<span class="item-genero-badge">' + primeiroGenero + '</span>' +
            '<span class="item-popularidade">' + artista.popularity + '</span>';

        item.addEventListener('click', function () { selecionarArtista(artista); });
        container.appendChild(item);
    });
}

function filtrarLista() {
    var termo = document.getElementById('input-busca').value.toLowerCase();
    var filtrado = listaArtistas.filter(function (a) {
        return a.nome.toLowerCase().includes(termo);
    });
    renderModalLista(filtrado);
}

function fecharModal() {
    document.getElementById('modal-fundo').style.display = 'none';
}

// ─── SELEÇÃO DE ARTISTA ───────────────────────────────────────────────────────

async function selecionarArtista(artistaBasico) {
    fecharModal();
    var slot = slotAtivo;

    try {
        var resDetalhe = fetch('http://localhost:3333/artistas/' + artistaBasico.id);
        var resAudio = fetch('http://localhost:3333/artistas/' + artistaBasico.id + '/audio');

        var responses = await Promise.all([resDetalhe, resAudio]);
        var artista = await responses[0].json();
        var audio = await responses[1].json();

        estado[slot] = artista;
        audioEstado[slot] = audio;

        renderSlotArtista(slot, artista);

        if (estado[1] && estado[2]) {
            atualizarPaineis();
        }
    } catch (e) {
        console.error('Erro ao carregar dados do artista:', e);
    }
}

function renderSlotArtista(slot, artista) {
    document.getElementById('slot-vazio-' + slot).style.display = 'none';
    document.getElementById('slot-artista-' + slot).style.display = 'flex';

    var primeiroGenero = artista.genre ? artista.genre.split(',')[0].trim() : 'Desconhecido';
    document.getElementById('nome-slot-' + slot).textContent = artista.nome;
    document.getElementById('genero-slot-' + slot).textContent = primeiroGenero;
    document.getElementById('pop-slot-' + slot).textContent = artista.popularity;
}

// ─── PAINÉIS DE COMPARAÇÃO ────────────────────────────────────────────────────

function atualizarPaineis() {
    document.getElementById('secao-paineis').style.display = 'block';

    document.querySelectorAll('.nome-comp-1').forEach(function (el) { el.textContent = estado[1].nome; });
    document.querySelectorAll('.nome-comp-2').forEach(function (el) { el.textContent = estado[2].nome; });

    renderEngajamento(estado[1], estado[2]);
    renderAudio(audioEstado[1], audioEstado[2]);
}

function renderEngajamento(a1, a2) {
    var metricas = [
        { id: 'views',      v1: Number(a1.views),      v2: Number(a2.views),      fmt: formatarNumero },
        { id: 'likes',      v1: Number(a1.likes),      v2: Number(a2.likes),      fmt: formatarNumero },
        { id: 'followers',  v1: Number(a1.followers),  v2: Number(a2.followers),  fmt: formatarNumero },
        { id: 'popularity', v1: Number(a1.popularity), v2: Number(a2.popularity), fmt: function (v) { return v; } }
    ];

    metricas.forEach(function (m) {
        var badge = calcularBadge(m.v1, m.v2);

        document.getElementById('eng-' + m.id + '-val-1').textContent = m.fmt(m.v1);
        document.getElementById('eng-' + m.id + '-val-2').textContent = m.fmt(m.v2);

        var b1 = document.getElementById('eng-' + m.id + '-badge-1');
        var b2 = document.getElementById('eng-' + m.id + '-badge-2');
        b1.className = 'badge ' + (badge.melhor === 1 ? 'up' : 'down');
        b1.innerHTML = '<span class="arrow">' + (badge.melhor === 1 ? '↑' : '↓') + '</span>' + badge.pct1;
        b2.className = 'badge ' + (badge.melhor === 2 ? 'up' : 'down');
        b2.innerHTML = '<span class="arrow">' + (badge.melhor === 2 ? '↑' : '↓') + '</span>' + badge.pct2;

        document.getElementById('eng-' + m.id + '-delta').textContent = '△ ' + badge.delta;
    });

    atualizarEngCards(a1, a2);
}

function atualizarEngCards(a1, a2) {
    var views1 = Number(a1.views), views2 = Number(a2.views);
    var likes1 = Number(a1.likes), likes2 = Number(a2.likes);
    var followers1 = Number(a1.followers), followers2 = Number(a2.followers);
    var pop1 = Number(a1.popularity), pop2 = Number(a2.popularity);

    var tc1 = views1 > 0 ? (likes1 / views1 * 100).toFixed(2) : '0.00';
    var tc2 = views2 > 0 ? (likes2 / views2 * 100).toFixed(2) : '0.00';
    atualizarEngCard('taxa-curtidas', a1.nome, a2.nome, tc1 + '%', tc2 + '%', parseFloat(tc1), parseFloat(tc2));

    var leal1 = followers1 > 0 ? (likes1 / followers1 * 100).toFixed(2) : '0.00';
    var leal2 = followers2 > 0 ? (likes2 / followers2 * 100).toFixed(2) : '0.00';
    atualizarEngCard('lealdade', a1.nome, a2.nome, leal1 + '%', leal2 + '%', parseFloat(leal1), parseFloat(leal2));

    atualizarEngCard('score', a1.nome, a2.nome, pop1, pop2, pop1, pop2);

    var vps1 = followers1 > 0 ? (views1 / followers1).toFixed(1) : '0';
    var vps2 = followers2 > 0 ? (views2 / followers2).toFixed(1) : '0';
    atualizarEngCard('views-seguidor', a1.nome, a2.nome, vps1 + 'x', vps2 + 'x', parseFloat(vps1), parseFloat(vps2));
}

function atualizarEngCard(cardId, nome1, nome2, val1, val2, numVal1, numVal2) {
    var el = document.getElementById('engcard-' + cardId);
    if (!el) return;

    el.querySelector('.nome-engcard-1').textContent = nome1;
    el.querySelector('.nome-engcard-2').textContent = nome2;
    el.querySelector('.val-engcard-1').textContent = val1;
    el.querySelector('.val-engcard-2').textContent = val2;

    var max = Math.max(numVal1, numVal2) || 1;
    el.querySelector('.bar-engcard-1').style.width = ((numVal1 / max) * 100) + '%';
    el.querySelector('.bar-engcard-2').style.width = ((numVal2 / max) * 100) + '%';

    var b1 = el.querySelector('.badge-engcard-1');
    var b2 = el.querySelector('.badge-engcard-2');
    if (numVal1 > numVal2) {
        b1.className = 'eng-badge badge-engcard-1 up';   b1.textContent = '↑';
        b2.className = 'eng-badge badge-engcard-2 down'; b2.textContent = '↓';
    } else if (numVal2 > numVal1) {
        b1.className = 'eng-badge badge-engcard-1 down'; b1.textContent = '↓';
        b2.className = 'eng-badge badge-engcard-2 up';   b2.textContent = '↑';
    } else {
        b1.className = 'eng-badge badge-engcard-1 neutral'; b1.textContent = '=';
        b2.className = 'eng-badge badge-engcard-2 neutral'; b2.textContent = '=';
    }

    var deltaNum = numVal1 - numVal2;
    el.querySelector('.delta-engcard').textContent = '△ ' + (deltaNum >= 0 ? '+' : '') + deltaNum.toFixed(2);
}

function renderAudio(aud1, aud2) {
    if (!aud1 || !aud2) return;

    var metricas = [
        { id: 'danceability',    v1: aud1.danceability,    v2: aud2.danceability,    fmt: function (v) { return Math.round(parseFloat(v) * 100); } },
        { id: 'energy',         v1: aud1.energy,         v2: aud2.energy,         fmt: function (v) { return Math.round(parseFloat(v) * 100); } },
        { id: 'loudness',       v1: aud1.loudness,       v2: aud2.loudness,       fmt: function (v) { return parseFloat(v).toFixed(1); } },
        { id: 'speechiness',    v1: aud1.speechiness,    v2: aud2.speechiness,    fmt: function (v) { return parseFloat(v).toFixed(2); } },
        { id: 'instrumentalness', v1: aud1.instrumentalness, v2: aud2.instrumentalness, fmt: function (v) { return parseFloat(v).toFixed(2); } },
        { id: 'valence',        v1: aud1.valence,        v2: aud2.valence,        fmt: function (v) { return parseFloat(v).toFixed(2); } }
    ];

    metricas.forEach(function (m) {
        var nv1 = parseFloat(m.v1), nv2 = parseFloat(m.v2);
        var badge = calcularBadge(nv1, nv2);

        document.getElementById('aud-' + m.id + '-val-1').textContent = m.fmt(m.v1);
        document.getElementById('aud-' + m.id + '-val-2').textContent = m.fmt(m.v2);

        var b1 = document.getElementById('aud-' + m.id + '-badge-1');
        var b2 = document.getElementById('aud-' + m.id + '-badge-2');
        b1.className = 'badge ' + (badge.melhor === 1 ? 'up' : 'down');
        b1.innerHTML = '<span class="arrow">' + (badge.melhor === 1 ? '↑' : '↓') + '</span>' + badge.pct1;
        b2.className = 'badge ' + (badge.melhor === 2 ? 'up' : 'down');
        b2.innerHTML = '<span class="arrow">' + (badge.melhor === 2 ? '↑' : '↓') + '</span>' + badge.pct2;

        document.getElementById('aud-' + m.id + '-delta').textContent = '△ ' + badge.delta;
    });

    atualizarRadar(aud1, aud2);
}

function atualizarRadar(aud1, aud2) {
    function normLoudness(l) {
        return Math.max(0, Math.min(100, ((parseFloat(l) + 60) / 60) * 100));
    }

    var dados1 = [
        parseFloat(aud1.energy) * 100,
        parseFloat(aud1.danceability) * 100,
        normLoudness(aud1.loudness),
        parseFloat(aud1.speechiness) * 100,
        parseFloat(aud1.instrumentalness) * 100,
        parseFloat(aud1.valence) * 100
    ];
    var dados2 = [
        parseFloat(aud2.energy) * 100,
        parseFloat(aud2.danceability) * 100,
        normLoudness(aud2.loudness),
        parseFloat(aud2.speechiness) * 100,
        parseFloat(aud2.instrumentalness) * 100,
        parseFloat(aud2.valence) * 100
    ];

    if (radarChart) {
        radarChart.destroy();
        radarChart = null;
    }

    var ctx = document.getElementById('graficoRadar').getContext('2d');
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Energia', 'Dançab.', 'Volume', 'Fala', 'Instrum.', 'Positiv.'],
            datasets: [
                {
                    label: estado[1].nome,
                    data: dados1,
                    borderColor: '#1A0A2E',
                    backgroundColor: 'rgba(59, 31, 168, 0.15)',
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: estado[2].nome,
                    data: dados2,
                    borderColor: '#A855F7',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    borderWidth: 2,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: { display: false },
                    pointLabels: { font: { size: 11 }, color: '#888' },
                    grid: { color: 'rgba(168, 85, 247, 0.25)' },
                    angleLines: { color: 'rgba(168, 85, 247, 0.15)' }
                }
            }
        }
    });
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

function calcularBadge(v1, v2) {
    var media = (Math.abs(v1) + Math.abs(v2)) / 2;
    if (media === 0) return { melhor: 0, pct1: '0%', pct2: '0%', delta: '0' };

    var melhor = v1 >= v2 ? 1 : 2;
    var pctDiff = Math.abs((v1 - v2) / media * 100).toFixed(1);
    var pct1 = v1 >= v2 ? ('+' + pctDiff + '%') : ('-' + pctDiff + '%');
    var pct2 = v2 >= v1 ? ('+' + pctDiff + '%') : ('-' + pctDiff + '%');

    var deltaNum = v1 - v2;
    var delta;
    if (Math.abs(deltaNum) >= 1e9)      delta = (deltaNum >= 0 ? '+' : '') + (deltaNum / 1e9).toFixed(1) + 'B';
    else if (Math.abs(deltaNum) >= 1e6) delta = (deltaNum >= 0 ? '+' : '') + (deltaNum / 1e6).toFixed(1) + 'M';
    else if (Math.abs(deltaNum) >= 1e3) delta = (deltaNum >= 0 ? '+' : '') + (deltaNum / 1e3).toFixed(1) + 'K';
    else                                delta = (deltaNum >= 0 ? '+' : '') + deltaNum.toFixed(2);

    return { melhor: melhor, pct1: pct1, pct2: pct2, delta: delta };
}

function formatarNumero(n) {
    if (n === null || n === undefined) return '-';
    n = Number(n);
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}
