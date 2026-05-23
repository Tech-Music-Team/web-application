var playlists = [];
var playlistsFiltrados = [];
var playlistEditandoId = null;

var CORES_POSICAO = ['#D4AF37', '#A8A9AD', '#CD7F32'];

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    fetchPlaylists();
    attachEventListeners();
});

function getUsuarioId() {
    var id = sessionStorage.ID_USUARIO;
    return id ? parseInt(id) : 0;
}

function hojeFormatado() {
    var d = new Date();
    var mes = String(d.getMonth() + 1).padStart(2, '0');
    var dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
}

async function fetchPlaylists() {
    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        document.getElementById('ranking-body').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Usuário não autenticado.</p>';
        return;
    }

    try {
        var response = await fetch('http://localhost:3333/setlists?usuario=' + usuarioId);
        if (!response.ok) throw new Error('Erro ' + response.status);
        playlists = await response.json();
        playlistsFiltrados = playlists.slice();
        renderCards();
    } catch (e) {
        console.error('Erro ao carregar playlists:', e);
        document.getElementById('ranking-body').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Erro ao carregar playlists.</p>';
    }
}

function renderCards() {
    var container = document.getElementById('ranking-body');
    if (!container) return;

    if (playlistsFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Nenhuma playlist encontrada.</p>';
        return;
    }

    var html = '';
    playlistsFiltrados.forEach(function (playlist, index) {
        var cor = CORES_POSICAO[index] || getPlaceholderColor(playlist.id_setlist);
        var posicao = (index + 1) + 'º';
        var statusClass = playlist.situacao === 'realizado' ? 'status-realizado' : 'status-pendente';
        var statusIcon = playlist.situacao === 'realizado' ? 'check_circle' : 'schedule';

        html +=
            '<div class="card">' +
                '<div class="left-content-group">' +
                    '<span class="ranking-number" style="color:' + cor + '">' + posicao + '</span>' +
                    '<div style="width:65px;height:65px;background:' + cor + ';border-radius:8px;flex-shrink:0;"></div>' +
                    '<div class="artist-info-header">' +
                        '<span class="artist-name">' + playlist.nome + '</span>' +
                        '<span class="playlist-meta">' +
                            '<span class="' + statusClass + '">' +
                                '<span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;">' + statusIcon + '</span> ' +
                                playlist.situacao +
                            '</span>' +
                            '<span style="color:#999;font-size:11px;margin-left:12px;">' + playlist.data_evento + '</span>' +
                        '</span>' +
                    '</div>' +
                '</div>' +
                '<ul>' +
                    '<li>' +
                        '<span class="artist-atribute">Popularidade Média</span>' +
                        '<span class="atribute-value">' + playlist.avg_popularidade + '</span>' +
                    '</li>' +
                    '<li>' +
                        '<span class="artist-atribute">Músicas</span>' +
                        '<span class="atribute-value">' + playlist.qtd_musicas + '</span>' +
                    '</li>' +
                '</ul>' +
                '<div class="right-content-group">' +
                    '<button class="btn-edit-playlist" data-id="' + playlist.id_setlist + '" title="Editar playlist">' +
                        '<span class="material-symbols-outlined">edit</span>' +
                    '</button>' +
                    '<button class="btn-delete-playlist" data-id="' + playlist.id_setlist + '" title="Excluir playlist">' +
                        '<span class="material-symbols-outlined">delete</span>' +
                    '</button>' +
                    '<button class="details-button" data-id="' + playlist.id_setlist + '">Detalhes da playlist</button>' +
                '</div>' +
            '</div>';
    });

    container.innerHTML = html;
    colorirPosicoes();
}

function colorirPosicoes() {
    var rankings = document.querySelectorAll('.ranking-number');
    rankings.forEach(function (el) {
        var texto = el.textContent.trim();
        var cor = CORES_POSICAO[parseInt(texto) - 1] || getPlaceholderColor(parseInt(texto));
        if (!CORES_POSICAO[parseInt(texto) - 1]) {
            el.style.color = '#1A0A2E';
        }
    });
}

function filtrar() {
    var termo = document.getElementById('input-busca').value.toLowerCase();
    playlistsFiltrados = playlists.filter(function (p) {
        return p.nome.toLowerCase().includes(termo);
    });
    renderCards();
}

function abrirModalCriar() {
    document.getElementById('modal-criar-playlist').style.display = 'flex';
    document.getElementById('input-nome-playlist').value = '';
    document.getElementById('input-data-playlist').value = hojeFormatado();
    document.getElementById('input-nome-playlist').focus();
}

function fecharModalCriar() {
    document.getElementById('modal-criar-playlist').style.display = 'none';
}

async function criarPlaylist() {
    var nome = document.getElementById('input-nome-playlist').value.trim();
    var dataEvento = document.getElementById('input-data-playlist').value;

    if (!nome) {
        alert('Informe um nome para a playlist.');
        return;
    }
    if (!dataEvento) {
        alert('Informe a data do evento.');
        return;
    }

    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        alert('Usuário não autenticado.');
        return;
    }

    try {
        var response = await fetch('http://localhost:3333/setlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, usuario: usuarioId, dataEvento: dataEvento })
        });

        if (!response.ok) {
            var msg = await response.text();
            throw new Error(msg || 'Erro ' + response.status);
        }

        fecharModalCriar();
        await fetchPlaylists();
    } catch (e) {
        console.error('Erro ao criar playlist:', e);
        alert(e.message || 'Erro ao criar playlist. Tente novamente.');
    }
}

function abrirModalEditar(id) {
    playlistEditandoId = id;
    var playlist = playlists.find(function (p) { return p.id_setlist === id; });
    if (!playlist) return;

    document.getElementById('edit-nome-playlist').value = playlist.nome;
    var dataInput = document.getElementById('edit-data-playlist');
    if (playlist.data_evento) {
        var partes = playlist.data_evento.split('/');
        dataInput.value = partes[2] + '-' + partes[1] + '-' + partes[0];
    } else {
        dataInput.value = hojeFormatado();
    }
    document.getElementById('modal-editar-playlist').style.display = 'flex';
    document.getElementById('edit-nome-playlist').focus();
}

function fecharModalEditar() {
    document.getElementById('modal-editar-playlist').style.display = 'none';
    playlistEditandoId = null;
}

async function editarPlaylist() {
    if (!playlistEditandoId) return;

    var nome = document.getElementById('edit-nome-playlist').value.trim();
    var dataEvento = document.getElementById('edit-data-playlist').value;

    if (!nome) { alert('Informe um nome para a playlist.'); return; }
    if (!dataEvento) { alert('Informe a data do evento.'); return; }

    try {
        var response = await fetch('http://localhost:3333/setlists/' + playlistEditandoId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, dataEvento: dataEvento })
        });

        if (!response.ok) {
            var msg = await response.text();
            throw new Error(msg || 'Erro ' + response.status);
        }

        fecharModalEditar();
        await fetchPlaylists();
    } catch (e) {
        console.error('Erro ao editar playlist:', e);
        alert(e.message || 'Erro ao editar playlist. Tente novamente.');
    }
}

async function deletarPlaylist(id) {
    if (!confirm('Tem certeza que deseja excluir esta playlist?')) return;

    try {
        var response = await fetch('http://localhost:3333/setlists/' + id, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        await fetchPlaylists();
    } catch (e) {
        console.error('Erro ao deletar playlist:', e);
        alert('Erro ao deletar playlist. Tente novamente.');
    }
}

function attachEventListeners() {
    var searchInput = document.getElementById('input-busca');
    if (searchInput) {
        searchInput.addEventListener('input', filtrar);
    }

    document.getElementById('ranking-body').addEventListener('click', function (e) {
        var btn = e.target.closest('.details-button');
        if (btn) {
            var id = btn.getAttribute('data-id');
            window.location.href = 'detalhesPlaylist.html?id=' + id;
            return;
        }

        var editBtn = e.target.closest('.btn-edit-playlist');
        if (editBtn) {
            abrirModalEditar(parseInt(editBtn.getAttribute('data-id')));
            return;
        }

        var deleteBtn = e.target.closest('.btn-delete-playlist');
        if (deleteBtn) {
            deletarPlaylist(parseInt(deleteBtn.getAttribute('data-id')));
            return;
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            fecharModalCriar();
            fecharModalEditar();
        }
        if (e.key === 'Enter') {
            var modalCriar = document.getElementById('modal-criar-playlist');
            if (modalCriar.style.display === 'flex') {
                criarPlaylist();
                return;
            }
            var modalEditar = document.getElementById('modal-editar-playlist');
            if (modalEditar.style.display === 'flex') {
                editarPlaylist();
                return;
            }
        }
    });
}

function getPlaceholderColor(id) {
    var cores = [
        '#A855F7', '#D421BF', '#EC4899', '#06B6D4',
        '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'
    ];
    return cores[id % cores.length];
}
