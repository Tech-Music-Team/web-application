var estado = { 1: null, 2: null };
var slotAtivo = null;
var listaMusicas = [];
var radarChart = null;
var musicaIdsSelecionados = { 1: null, 2: null };

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    attachEventListeners();
    carregarDaURL();
});

function carregarDaURL() {
    var params = new URLSearchParams(window.location.search);
    var id1 = params.get('id');
    var id2 = params.get('id2');

    if (id1) {
        slotAtivo = '1';
        selecionarMusicaPorId('1', parseInt(id1));
    }
    if (id2) {
        setTimeout(function () {
            slotAtivo = '2';
            selecionarMusicaPorId('2', parseInt(id2));
        }, 200);
    } else if (id1) {
        setTimeout(function () {
            abrirSeletor('2');
        }, 400);
    }
}

async function selecionarMusicaPorId(slot, musicaId) {
    try {
        var response = await fetch('/musicas/' + musicaId + '/detalhes');

        if (!response.ok) {
            showErrorSlot(slot, 'Musica nao encontrada');
            return;
        }

        var musica = await response.json();

        estado[slot] = musica;
        musicaIdsSelecionados[slot] = musicaId;

        renderSlotMusica(slot, musica);

        if (estado[1] && estado[2]) {
            atualizarPaineis();
        }
    } catch (e) {
        console.error('Erro ao carregar musica da URL:', e);
        showErrorSlot(slot, 'Erro ao carregar musica');
    }
}

function showErrorSlot(slot, mensagem) {
    document.getElementById('slot-vazio-' + slot).style.display = 'flex';
    document.getElementById('slot-artista-' + slot).style.display = 'none';
    var vazio = document.getElementById('slot-vazio-' + slot);
    vazio.innerHTML = '<span class="material-symbols-outlined">error</span><span>' + mensagem + '</span>';
}

function showError(mensagem) {
    var msgBox = document.getElementById('error-message');
    if (!msgBox) {
        msgBox = document.createElement('div');
        msgBox.id = 'error-message';
        msgBox.style.cssText = 'text-align:center;padding:12px;margin:12px 0;background:#fde8e8;color:#c53030;border-radius:8px;font-size:14px;';
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(msgBox, mainContent.querySelector('.profile-card'));
        }
    }
    msgBox.textContent = mensagem;
    msgBox.style.display = 'block';
    setTimeout(function () {
        msgBox.style.display = 'none';
    }, 5000);
}

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

    document.querySelectorAll('.btn-setlist').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var slot = this.getAttribute('data-slot');
            adicionarPlaylist(slot);
        });
    });

    document.querySelectorAll('.btn-remove-artist').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var slot = this.getAttribute('data-slot');
            removerMusica(slot);
        });
    });
}

function adicionarPlaylist(slot) {
    var musica = estado[slot];
    if (!musica) {
        showError('Selecione uma musica primeiro.');
        return;
    }
    adicionarASetlist(musica.id, musica.track);
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

async function abrirSeletor(slot) {
    slotAtivo = slot;
    document.getElementById('input-busca').value = '';

    if (listaMusicas.length === 0) {
        try {
            var response = await fetch('/musicas/top?limit=10000');
            if (!response.ok) throw new Error('Erro ' + response.status);
            listaMusicas = await response.json();
        } catch (e) {
            console.error('Erro ao carregar musicas:', e);
            document.getElementById('lista-selecao').innerHTML =
                '<p style="text-align:center;padding:20px;color:#999;">Erro ao carregar lista de musicas.</p>';
            document.getElementById('modal-fundo').style.display = 'flex';
            return;
        }
    }

    renderModalLista(listaMusicas);
    document.getElementById('modal-fundo').style.display = 'flex';
}

function renderModalLista(lista) {
    var container = document.getElementById('lista-selecao');
    container.innerHTML = '';
    var coresPosicao = ['#D4AF37', '#A8A9AD', '#CD7F32'];

    lista.forEach(function (musica, i) {
        var item = document.createElement('div');
        item.className = 'item-selecao';
        var cor = coresPosicao[i] || '#A855F7';
        var artistaNome = musica.artist || 'Desconhecido';

        item.innerHTML =
            '<span class="item-pos" style="color:' + cor + '">' + (i + 1) + 'º</span>' +
            '<span class="item-nome">' + musica.track + '</span>' +
            '<span class="item-genero-badge">' + artistaNome + '</span>' +
            '<span class="item-popularidade">' + musica.popularity + '</span>';

        item.addEventListener('click', function () { selecionarMusica(musica); });
        container.appendChild(item);
    });
}

function filtrarLista() {
    var termo = document.getElementById('input-busca').value.toLowerCase();
    var filtrado = listaMusicas.filter(function (m) {
        return m.track.toLowerCase().includes(termo) ||
               (m.artist && m.artist.toLowerCase().includes(termo));
    });
    renderModalLista(filtrado);
}

function fecharModal() {
    document.getElementById('modal-fundo').style.display = 'none';
}

// ─── SELEÇÃO DE MÚSICA ───────────────────────────────────────────────────────

async function selecionarMusica(musicaBasica) {
    fecharModal();
    var slot = slotAtivo;

    try {
        var response = await fetch('/musicas/' + musicaBasica.id + '/detalhes');

        if (!response.ok) {
            showError('Erro ao carregar dados da musica. Tente novamente.');
            return;
        }

        var musica = await response.json();

        estado[slot] = musica;
        musicaIdsSelecionados[slot] = musicaBasica.id;

        renderSlotMusica(slot, musica);

        if (estado[1] && estado[2]) {
            atualizarPaineis();
        }

        atualizarURL();
    } catch (e) {
        console.error('Erro ao carregar dados da musica:', e);
        showError('Erro ao carregar dados da musica. Verifique sua conexao.');
    }
}

function atualizarURL() {
    var id1 = musicaIdsSelecionados[1];
    var id2 = musicaIdsSelecionados[2];
    var params = [];

    if (id1) params.push('id=' + id1);
    if (id2) params.push('id2=' + id2);

    var novaURL = window.location.pathname;
    if (params.length > 0) {
        novaURL += '?' + params.join('&');
    }
    window.history.replaceState({}, '', novaURL);
}

function removerMusica(slot) {
    estado[slot] = null;
    musicaIdsSelecionados[slot] = null;

    document.getElementById('slot-vazio-' + slot).style.display = 'flex';
    document.getElementById('slot-artista-' + slot).style.display = 'none';

    if (!estado[1] || !estado[2]) {
        document.getElementById('secao-paineis').style.display = 'none';
    } else {
        atualizarPaineis();
    }

    atualizarURL();
}

function renderSlotMusica(slot, musica) {
    document.getElementById('slot-vazio-' + slot).style.display = 'none';
    document.getElementById('slot-artista-' + slot).style.display = 'flex';

    var corPlaceholder = getPlaceholderColor(musica.id);
    var fotoPlaceholder = document.getElementById('foto-placeholder-' + slot);
    if (fotoPlaceholder) {
        fotoPlaceholder.style.backgroundColor = corPlaceholder;
        fotoPlaceholder.style.width = '70px';
        fotoPlaceholder.style.height = '70px';
        fotoPlaceholder.style.borderRadius = '8px';
        fotoPlaceholder.classList.add('spotify-artist-img');
        fotoPlaceholder.setAttribute('data-artist-name', musica.artist || '');
        carregarImagemSpotify(musica.artist || '', fotoPlaceholder);
    }

    document.getElementById('nome-slot-' + slot).textContent = musica.track;
    document.getElementById('autor-slot-' + slot).textContent = musica.artist;
    document.getElementById('pop-slot-' + slot).textContent = musica.popularity;

    var streamsEl = document.getElementById('streams-slot-' + slot);
    if (streamsEl) {
        streamsEl.textContent = formatarNumero(musica.streams);
    }

    var removeBtn = document.getElementById('btn-remover-' + slot);
    if (removeBtn) {
        removeBtn.style.display = 'inline-flex';
    }
}

// ─── PAINÉIS DE COMPARAÇÃO ────────────────────────────────────────────────────

function atualizarPaineis() {
    document.getElementById('secao-paineis').style.display = 'block';

    document.querySelectorAll('.nome-comp-1').forEach(function (el) { el.textContent = estado[1].track; });
    document.querySelectorAll('.nome-comp-2').forEach(function (el) { el.textContent = estado[2].track; });

    renderEngajamento(estado[1], estado[2]);
    renderAudio(estado[1], estado[2]);
}

function renderEngajamento(m1, m2) {
    var metricas = [
        { id: 'views',      v1: Number(m1.views),      v2: Number(m2.views),      fmt: formatarNumero },
        { id: 'streams',    v1: Number(m1.streams),    v2: Number(m2.streams),    fmt: formatarNumero },
        { id: 'likes',      v1: Number(m1.likes),      v2: Number(m2.likes),      fmt: formatarNumero },
        { id: 'comments',   v1: Number(m1.comments),   v2: Number(m2.comments),   fmt: formatarNumero }
    ];

    metricas.forEach(function (m) {
        var badge = calcularBadge(m.v1, m.v2);

        document.getElementById('eng-' + m.id + '-val-1').textContent = m.fmt(m.v1);
        document.getElementById('eng-' + m.id + '-val-2').textContent = m.fmt(m.v2);

        var b1 = document.getElementById('eng-' + m.id + '-badge-1');
        var b2 = document.getElementById('eng-' + m.id + '-badge-2');
        if (b1) {
            b1.className = 'badge ' + (badge.melhor === 1 ? 'up' : 'down');
            b1.innerHTML = '<span class="arrow">' + (badge.melhor === 1 ? '↑' : '↓') + '</span>' + badge.pct1;
        }
        if (b2) {
            b2.className = 'badge ' + (badge.melhor === 2 ? 'up' : 'down');
            b2.innerHTML = '<span class="arrow">' + (badge.melhor === 2 ? '↑' : '↓') + '</span>' + badge.pct2;
        }

        var deltaEl = document.getElementById('eng-' + m.id + '-delta');
        if (deltaEl) {
            deltaEl.textContent = '△ ' + badge.delta;
        }
    });

    atualizarEngCards(m1, m2);
}

function atualizarEngCards(m1, m2) {
    var views1 = Number(m1.views), views2 = Number(m2.views);
    var streams1 = Number(m1.streams), streams2 = Number(m2.streams);
    var likes1 = Number(m1.likes), likes2 = Number(m2.likes);
    var comments1 = Number(m1.comments), comments2 = Number(m2.comments);

    var engReal1 = views1 > 0 ? ((likes1 + comments1) / views1 * 100).toFixed(2) : '0.00';
    var engReal2 = views2 > 0 ? ((likes2 + comments2) / views2 * 100).toFixed(2) : '0.00';
    atualizarEngCard('engajamento-real', m1.track, m2.track, engReal1 + '%', engReal2 + '%', parseFloat(engReal1), parseFloat(engReal2));

    var total1 = streams1 + views1;
    var total2 = streams2 + views2;
    var pref1 = total1 > 0 ? (streams1 / total1 * 100).toFixed(2) : '0.00';
    var pref2 = total2 > 0 ? (streams2 / total2 * 100).toFixed(2) : '0.00';
    atualizarEngCard('conversao', m1.track, m2.track, pref1 + '%', pref2 + '%', parseFloat(pref1), parseFloat(pref2));

    var razao1 = views1 > 0 ? (streams1 / views1).toFixed(2) : '0';
    var razao2 = views2 > 0 ? (streams2 / views2).toFixed(2) : '0';
    atualizarEngCard('retencao', m1.track, m2.track, razao1 + 'x', razao2 + 'x', parseFloat(razao1), parseFloat(razao2));

    var discussao1 = views1 > 0 ? (comments1 / views1 * 100).toFixed(3) : '0.000';
    var discussao2 = views2 > 0 ? (comments2 / views2 * 100).toFixed(3) : '0.000';
    atualizarEngCard('discussao', m1.track, m2.track, discussao1 + '%', discussao2 + '%', parseFloat(discussao1), parseFloat(discussao2));
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

function renderAudio(m1, m2) {
    if (!m1 || !m2) return;

    var metricas = [
        { id: 'danceability',    v1: m1.danceability,    v2: m2.danceability,    fmt: function (v) { return Math.round(parseFloat(v) * 100); } },
        { id: 'energy',         v1: m1.energy,         v2: m2.energy,         fmt: function (v) { return Math.round(parseFloat(v) * 100); } },
        { id: 'loudness',       v1: m1.loudness,       v2: m2.loudness,       fmt: function (v) { return parseFloat(v).toFixed(1); } },
        { id: 'speechiness',    v1: m1.speechiness,    v2: m2.speechiness,    fmt: function (v) { return parseFloat(v).toFixed(2); } },
        { id: 'instrumentalness', v1: m1.instrumentalness, v2: m2.instrumentalness, fmt: function (v) { return parseFloat(v).toFixed(2); } },
        { id: 'valence',        v1: m1.valence,        v2: m2.valence,        fmt: function (v) { return parseFloat(v).toFixed(2); } }
    ];

    metricas.forEach(function (m) {
        var nv1 = parseFloat(m.v1), nv2 = parseFloat(m.v2);
        var badge = calcularBadgeNeutro(nv1, nv2);

        document.getElementById('aud-' + m.id + '-val-1').textContent = m.fmt(m.v1);
        document.getElementById('aud-' + m.id + '-val-2').textContent = m.fmt(m.v2);

        var b1 = document.getElementById('aud-' + m.id + '-badge-1');
        var b2 = document.getElementById('aud-' + m.id + '-badge-2');
        if (b1) {
            b1.className = 'badge neutro';
            b1.innerHTML = '<span class="arrow">▶</span>' + badge.pct1;
        }
        if (b2) {
            b2.className = 'badge neutro';
            b2.innerHTML = '<span class="arrow">▶</span>' + badge.pct2;
        }

        var deltaEl = document.getElementById('aud-' + m.id + '-delta');
        if (deltaEl) {
            deltaEl.textContent = '△ ' + badge.delta;
        }
    });

    atualizarRadar(m1, m2);
}

function atualizarRadar(m1, m2) {
    function normLoudness(l) {
        return Math.max(0, Math.min(100, ((parseFloat(l) + 60) / 60) * 100));
    }

    var dados1 = [
        parseFloat(m1.energy) * 100,
        parseFloat(m1.danceability) * 100,
        normLoudness(m1.loudness),
        parseFloat(m1.speechiness) * 100,
        parseFloat(m1.instrumentalness) * 100,
        parseFloat(m1.valence) * 100
    ];
    var dados2 = [
        parseFloat(m2.energy) * 100,
        parseFloat(m2.danceability) * 100,
        normLoudness(m2.loudness),
        parseFloat(m2.speechiness) * 100,
        parseFloat(m2.instrumentalness) * 100,
        parseFloat(m2.valence) * 100
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
                    label: estado[1].track,
                    data: dados1,
                    borderColor: '#1A0A2E',
                    backgroundColor: 'rgba(59, 31, 168, 0.15)',
                    borderWidth: 2,
                    pointRadius: 2
                },
                {
                    label: estado[2].track,
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

