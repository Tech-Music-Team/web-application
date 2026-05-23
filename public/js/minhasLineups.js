var lineups = [];
var lineupsFiltrados = [];
var lineupEditandoId = null;

var CORES_POSICAO = ['#D4AF37', '#A8A9AD', '#CD7F32'];

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    fetchLineups();
    attachEventListeners();
});

function getUsuarioId() {
    var id = sessionStorage.ID_USUARIO;
    return id ? parseInt(id) : 0;
}

async function fetchLineups() {
    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        document.getElementById('ranking-body').innerHTML =
            '<p style="text-align:center;padding:40px;color:#999;">Usuário não autenticado.</p>';
        return;
    }

    try {
        var response = await fetch('http://localhost:3333/lineups?usuario=' + usuarioId);
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
    lineupsFiltrados = lineups.filter(function (l) {
        return l.nome.toLowerCase().includes(termo);
    });
    renderCards();
}

function abrirModalCriar() {
    document.getElementById('modal-criar-lineup').style.display = 'flex';
    document.getElementById('input-nome-lineup').value = '';
    document.getElementById('input-data-lineup').value = '';
    document.getElementById('input-nome-lineup').focus();
}

function fecharModalCriar() {
    document.getElementById('modal-criar-lineup').style.display = 'none';
}

async function criarLineup() {
    var nome = document.getElementById('input-nome-lineup').value.trim();
    var dataEvento = document.getElementById('input-data-lineup').value;

    if (!nome) {
        alert('Informe um nome para a lineup.');
        return;
    }
    if (!dataEvento) {
        alert('Selecione a data do evento.');
        return;
    }

    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        alert('Usuário não autenticado.');
        return;
    }

    try {
        var response = await fetch('http://localhost:3333/lineups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, usuario: usuarioId, dataEvento: dataEvento })
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        fecharModalCriar();
        await fetchLineups();
    } catch (e) {
        console.error('Erro ao criar lineup:', e);
        alert('Erro ao criar lineup. Tente novamente.');
    }
}

function abrirModalEditar(id) {
    lineupEditandoId = id;
    var lineup = lineups.find(function (l) { return l.id_lineup === id; });
    if (!lineup) return;

    document.getElementById('edit-nome-lineup').value = lineup.nome;
    document.getElementById('edit-data-lineup').value = converterData(lineup.data_evento);
    document.getElementById('modal-editar-lineup').style.display = 'flex';
    document.getElementById('edit-nome-lineup').focus();
}

function fecharModalEditar() {
    document.getElementById('modal-editar-lineup').style.display = 'none';
    lineupEditandoId = null;
}

function converterData(dataBr) {
    var partes = dataBr.split('/');
    if (partes.length === 3) {
        return partes[2] + '-' + partes[1] + '-' + partes[0];
    }
    return '';
}

async function editarLineup() {
    if (!lineupEditandoId) return;

    var nome = document.getElementById('edit-nome-lineup').value.trim();
    var dataEvento = document.getElementById('edit-data-lineup').value;

    if (!nome) { alert('Informe um nome para a lineup.'); return; }
    if (!dataEvento) { alert('Selecione a data do evento.'); return; }

    try {
        var response = await fetch('http://localhost:3333/lineups/' + lineupEditandoId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, dataEvento: dataEvento })
        });

        if (!response.ok) throw new Error('Erro ' + response.status);

        fecharModalEditar();
        await fetchLineups();
    } catch (e) {
        console.error('Erro ao editar lineup:', e);
        alert('Erro ao editar lineup. Tente novamente.');
    }
}

async function deletarLineup(id) {
    if (!confirm('Tem certeza que deseja excluir esta lineup?')) return;

    try {
        var response = await fetch('http://localhost:3333/lineups/' + id, {
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

function getPlaceholderColor(id) {
    var cores = [
        '#A855F7', '#D421BF', '#EC4899', '#06B6D4',
        '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'
    ];
    return cores[id % cores.length];
}
