var lineups = [];
var lineupsFiltrados = [];
var lineupEditandoId = null;

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    fetchLineups();
    attachEventListeners();
});

async function fetchLineups() {
    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        document.getElementById('ranking-body').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Usuário não autenticado.</p>';
        return;
    }

    try {
        var response = await fetch('/lineups?usuario=' + usuarioId);
        if (!response.ok) throw new Error('Erro ' + response.status);
        lineups = await response.json();
        lineupsFiltrados = lineups.slice();
        renderCards();
    } catch (e) {
        console.error('Erro ao carregar lineups:', e);
        document.getElementById('ranking-body').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Erro ao carregar lineups.</p>';
    }
}

function renderCards() {
    var container = document.getElementById('ranking-body');
    if (!container) return;

    if (lineupsFiltrados.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Nenhuma lineup encontrada.</p>';
        return;
    }

    var html = '';
    lineupsFiltrados.forEach(function (lineup, index) {
        var cor = CORES_POSICAO[index] || getPlaceholderColor(lineup.id_lineup);
        var posicao = (index + 1) + 'º';
        var statusClass = lineup.status === 'realizado' ? 'realizado' : 'pendente';

        html +=
            '<div class="card">' +
                '<div class="left-content-group">' +
                    '<span class="ranking-number" style="color:' + cor + '">' + posicao + '</span>' +
                    '<div style="width:65px;height:65px;background:' + cor + ';border-radius:8px;flex-shrink:0;"></div>' +
                    '<div class="artist-info-header">' +
                        '<span class="artist-name">' + lineup.nome + '</span>' +
                        '<span class="genre">' + lineup.data_evento + '</span>' +
                    '</div>' +
                '</div>' +
                '<ul>' +
                    '<li>' +
                        '<span class="artist-atribute">Popularidade Média</span>' +
                        '<span class="atribute-value">' + lineup.avg_popularidade + '</span>' +
                    '</li>' +
                    '<li>' +
                        '<span class="artist-atribute">Artistas</span>' +
                        '<span class="atribute-value">' + lineup.qtd_artistas + '</span>' +
                    '</li>' +
                '</ul>' +
                '<div class="status-setlist ' + statusClass + '">' +
                    '<div class="circulo"></div>' +
                    '<span>' + (lineup.status.charAt(0).toUpperCase() + lineup.status.slice(1)) + '</span>' +
                '</div>' +
                '<div class="right-content-group">' +
                    '<button class="btn-edit-lineup" data-id="' + lineup.id_lineup + '" title="Editar lineup">' +
                        '<span class="material-symbols-outlined">edit</span>' +
                    '</button>' +
                    '<button class="btn-delete-lineup" data-id="' + lineup.id_lineup + '" title="Excluir lineup">' +
                        '<span class="material-symbols-outlined">delete</span>' +
                    '</button>' +
                    '<button class="details-button" data-id="' + lineup.id_lineup + '">Detalhes da Line-up</button>' +
                '</div>' +
            '</div>';
    });

    container.innerHTML = html;
    colorirPosicoes();
}

function filtrar() {
    var termo = document.getElementById('input-busca').value.toLowerCase();
    lineupsFiltrados = lineups.filter(function (l) {
        return l.nome.toLowerCase().includes(termo);
    });
    renderCards();
}

function abrirModalCriar() {
    document.getElementById('modal-criar-lineup').style.display = 'flex';
    document.getElementById('input-nome-lineup').value = '';
    document.getElementById('input-data-lineup').value = '';
    document.getElementById('input-data-lineup').min = dataHojeISO();
    document.getElementById('input-notificacao-lineup').checked = true;
    document.getElementById('input-email-secundario-lineup').value = '';
    document.getElementById('input-email-grupo-lineup').style.display = 'flex';
    var msg = document.getElementById('msg-criar-lineup');
    msg.textContent = '';
    msg.className = 'msg-feedback';
    document.getElementById('input-nome-lineup').focus();
}

function fecharModalCriar() {
    document.getElementById('modal-criar-lineup').style.display = 'none';
}

async function criarLineup() {
    var nome = document.getElementById('input-nome-lineup').value.trim();
    var dataEvento = document.getElementById('input-data-lineup').value;
    var msg = document.getElementById('msg-criar-lineup');

    function mostrarErro(texto) {
        msg.textContent = texto;
        msg.className = 'msg-feedback erro';
    }

    msg.textContent = '';
    msg.className = 'msg-feedback';

    if (!nome) { mostrarErro('Informe um nome para a lineup.'); return; }
    if (!dataEvento) { mostrarErro('Selecione a data do evento.'); return; }

    var usuarioId = getUsuarioId();
    if (!usuarioId) { mostrarErro('Usuário não autenticado.'); return; }

    var notificacao = document.getElementById('input-notificacao-lineup').checked ? 1 : 0;
    var emailSecundario = notificacao ? (document.getElementById('input-email-secundario-lineup').value.trim() || null) : null;

    var btn = document.querySelector('#modal-criar-lineup .btn-confirmar');
    btn.disabled = true;
    try {
        var response = await fetch('/lineups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, usuario: usuarioId, dataEvento: dataEvento, notificacao: notificacao, emailSecundario: emailSecundario })
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        fecharModalCriar();
        await fetchLineups();
    } catch (e) {
        console.error('Erro ao criar lineup:', e);
        mostrarErro('Erro ao criar lineup. Tente novamente.');
    } finally {
        btn.disabled = false;
    }
}

function abrirModalEditar(id) {
    lineupEditandoId = id;
    var lineup = lineups.find(function (l) { return l.id_lineup === id; });
    if (!lineup) return;

    document.getElementById('edit-nome-lineup').value = lineup.nome;
    document.getElementById('edit-data-lineup').value = dataBRparaISO(lineup.data_evento);
    document.getElementById('edit-data-lineup').min = dataHojeISO();
    document.getElementById('edit-notificacao-lineup').checked = !!lineup.notificacao;
    document.getElementById('edit-email-secundario-lineup').value = lineup.email_secundario || '';
    document.getElementById('edit-email-grupo-lineup').style.display = lineup.notificacao ? 'flex' : 'none';
    var msg = document.getElementById('msg-editar-lineup');
    msg.textContent = '';
    msg.className = 'msg-feedback';
    document.getElementById('modal-editar-lineup').style.display = 'flex';
    document.getElementById('edit-nome-lineup').focus();
}

function fecharModalEditar() {
    document.getElementById('modal-editar-lineup').style.display = 'none';
    lineupEditandoId = null;
}

async function editarLineup() {
    if (!lineupEditandoId) return;

    var nome = document.getElementById('edit-nome-lineup').value.trim();
    var dataEvento = document.getElementById('edit-data-lineup').value;
    var msg = document.getElementById('msg-editar-lineup');

    function mostrarErro(texto) {
        msg.textContent = texto;
        msg.className = 'msg-feedback erro';
    }

    msg.textContent = '';
    msg.className = 'msg-feedback';

    if (!nome) { mostrarErro('Informe um nome para a lineup.'); return; }
    if (!dataEvento) { mostrarErro('Selecione a data do evento.'); return; }

    var notificacao = document.getElementById('edit-notificacao-lineup').checked ? 1 : 0;
    var emailSecundario = notificacao ? (document.getElementById('edit-email-secundario-lineup').value.trim() || null) : null;

    var btn = document.querySelector('#modal-editar-lineup .btn-confirmar');
    btn.disabled = true;
    try {
        var response = await fetch('/lineups/' + lineupEditandoId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, dataEvento: dataEvento, notificacao: notificacao, emailSecundario: emailSecundario })
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        fecharModalEditar();
        await fetchLineups();
    } catch (e) {
        console.error('Erro ao editar lineup:', e);
        mostrarErro('Erro ao editar lineup. Tente novamente.');
    } finally {
        btn.disabled = false;
    }
}

async function deletarLineup(id) {
    if (!confirm('Tem certeza que deseja excluir esta lineup?')) return;

    try {
        var response = await fetch('/lineups/' + id, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        await fetchLineups();
    } catch (e) {
        console.error('Erro ao deletar lineup:', e);
        alert('Erro ao deletar lineup. Tente novamente.');
    }
}

function attachEventListeners() {
    document.getElementById('input-notificacao-lineup').addEventListener('change', function () {
        document.getElementById('input-email-grupo-lineup').style.display = this.checked ? 'flex' : 'none';
    });
    document.getElementById('edit-notificacao-lineup').addEventListener('change', function () {
        document.getElementById('edit-email-grupo-lineup').style.display = this.checked ? 'flex' : 'none';
    });

    var searchInput = document.getElementById('input-busca');
    if (searchInput) {
        searchInput.addEventListener('input', filtrar);
    }

    document.getElementById('ranking-body').addEventListener('click', function (e) {
        var btn = e.target.closest('.details-button');
        if (btn) {
            var id = btn.getAttribute('data-id');
            window.location.href = 'detalhesLineup.html?id=' + id;
            return;
        }

        var editBtn = e.target.closest('.btn-edit-lineup');
        if (editBtn) {
            abrirModalEditar(parseInt(editBtn.getAttribute('data-id')));
            return;
        }

        var deleteBtn = e.target.closest('.btn-delete-lineup');
        if (deleteBtn) {
            deletarLineup(parseInt(deleteBtn.getAttribute('data-id')));
            return;
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            fecharModalCriar();
            fecharModalEditar();
        }
        if (e.key === 'Enter') {
            var modalCriar = document.getElementById('modal-criar-lineup');
            if (modalCriar.style.display === 'flex') {
                criarLineup();
                return;
            }
            var modalEditar = document.getElementById('modal-editar-lineup');
            if (modalEditar.style.display === 'flex') {
                editarLineup();
                return;
            }
        }
    });
}

