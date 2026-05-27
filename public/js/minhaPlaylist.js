var playlists = [];
var playlistsFiltrados = [];
var playlistEditandoId = null;

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    fetchPlaylists();
    attachEventListeners();
});

async function fetchPlaylists() {
    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        document.getElementById('ranking-body').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Usuário não autenticado.</p>';
        return;
    }

    try {
        var response = await fetch('/setlists?usuario=' + usuarioId);
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
    document.getElementById('input-data-playlist').value = dataHojeISO();
    document.getElementById('input-data-playlist').min = dataHojeISO();
    document.getElementById('input-notificacao-playlist').checked = true;
    document.getElementById('input-email-secundario-playlist').value = '';
    document.getElementById('input-email-grupo-playlist').style.display = 'flex';
    var msg = document.getElementById('msg-criar-playlist');
    msg.textContent = '';
    msg.className = 'msg-feedback';
    document.getElementById('input-nome-playlist').focus();
}

function fecharModalCriar() {
    document.getElementById('modal-criar-playlist').style.display = 'none';
}

async function criarPlaylist() {
    var nome = document.getElementById('input-nome-playlist').value.trim();
    var dataEvento = document.getElementById('input-data-playlist').value;
    var msg = document.getElementById('msg-criar-playlist');

    function mostrarErro(texto) {
        msg.textContent = texto;
        msg.className = 'msg-feedback erro';
    }

    msg.textContent = '';
    msg.className = 'msg-feedback';

    if (!nome) { mostrarErro('Informe um nome para a playlist.'); return; }
    if (!dataEvento) { mostrarErro('Informe a data do evento.'); return; }

    var usuarioId = getUsuarioId();
    if (!usuarioId) { mostrarErro('Usuário não autenticado.'); return; }

    var notificacao = document.getElementById('input-notificacao-playlist').checked ? 1 : 0;
    var emailSecundario = notificacao ? (document.getElementById('input-email-secundario-playlist').value.trim() || null) : null;

    var btn = document.querySelector('#modal-criar-playlist .btn-confirmar');
    btn.disabled = true;
    try {
        var response = await fetch('/setlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, usuario: usuarioId, dataEvento: dataEvento, notificacao: notificacao, emailSecundario: emailSecundario })
        });

        if (!response.ok) {
            var errText = await response.text();
            throw new Error(errText || 'Erro ' + response.status);
        }

        fecharModalCriar();
        await fetchPlaylists();
    } catch (e) {
        console.error('Erro ao criar playlist:', e);
        mostrarErro(e.message || 'Erro ao criar playlist. Tente novamente.');
    } finally {
        btn.disabled = false;
    }
}

function abrirModalEditar(id) {
    playlistEditandoId = id;
    var playlist = playlists.find(function (p) { return p.id_setlist === id; });
    if (!playlist) return;

    document.getElementById('edit-nome-playlist').value = playlist.nome;
    var dataInput = document.getElementById('edit-data-playlist');
    dataInput.min = dataHojeISO();
    if (playlist.data_evento) {
        dataInput.value = dataBRparaISO(playlist.data_evento);
    } else {
        dataInput.value = dataHojeISO();
    }
    document.getElementById('edit-notificacao-playlist').checked = !!playlist.notificacao;
    document.getElementById('edit-email-secundario-playlist').value = playlist.email_secundario || '';
    document.getElementById('edit-email-grupo-playlist').style.display = playlist.notificacao ? 'flex' : 'none';
    var msg = document.getElementById('msg-editar-playlist');
    msg.textContent = '';
    msg.className = 'msg-feedback';
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
    var msg = document.getElementById('msg-editar-playlist');

    function mostrarErro(texto) {
        msg.textContent = texto;
        msg.className = 'msg-feedback erro';
    }

    msg.textContent = '';
    msg.className = 'msg-feedback';

    if (!nome) { mostrarErro('Informe um nome para a playlist.'); return; }
    if (!dataEvento) { mostrarErro('Informe a data do evento.'); return; }

    var notificacao = document.getElementById('edit-notificacao-playlist').checked ? 1 : 0;
    var emailSecundario = notificacao ? (document.getElementById('edit-email-secundario-playlist').value.trim() || null) : null;

    var btn = document.querySelector('#modal-editar-playlist .btn-confirmar');
    btn.disabled = true;
    try {
        var response = await fetch('/setlists/' + playlistEditandoId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, dataEvento: dataEvento, notificacao: notificacao, emailSecundario: emailSecundario })
        });

        if (!response.ok) {
            var errText = await response.text();
            throw new Error(errText || 'Erro ' + response.status);
        }

        fecharModalEditar();
        await fetchPlaylists();
    } catch (e) {
        console.error('Erro ao editar playlist:', e);
        mostrarErro(e.message || 'Erro ao editar playlist. Tente novamente.');
    } finally {
        btn.disabled = false;
    }
}

async function deletarPlaylist(id) {
    if (!confirm('Tem certeza que deseja excluir esta playlist?')) return;

    try {
        var response = await fetch('/setlists/' + id, {
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
    document.getElementById('input-notificacao-playlist').addEventListener('change', function () {
        document.getElementById('input-email-grupo-playlist').style.display = this.checked ? 'flex' : 'none';
    });
    document.getElementById('edit-notificacao-playlist').addEventListener('change', function () {
        document.getElementById('edit-email-grupo-playlist').style.display = this.checked ? 'flex' : 'none';
    });

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

