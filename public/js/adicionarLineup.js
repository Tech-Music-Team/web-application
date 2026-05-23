function getUsuarioId() {
    var id = sessionStorage.ID_USUARIO;
    return id ? parseInt(id) : 0;
}

function adicionarALineup(artistaId, artistaNome) {
    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        alert('Usuário não autenticado.');
        return;
    }

    var modal = document.getElementById('modal-adicionar-lineup');
    if (!modal) {
        modal = criarModalLineup();
        document.body.appendChild(modal);
    }

    modal._artistaId = artistaId;
    document.getElementById('modal-lineup-artista-nome').textContent = artistaNome || 'Artista';
    document.getElementById('lista-lineups').innerHTML = '<p style="color:#999;font-size:13px;">Carregando lineups...</p>';
    modal.style.display = 'flex';

    fetch('http://localhost:3333/lineups?usuario=' + usuarioId)
        .then(function (r) { return r.json(); })
        .then(function (lineups) {
            var container = document.getElementById('lista-lineups');
            if (!lineups || lineups.length === 0) {
                container.innerHTML = '<p style="color:#999;font-size:13px;padding:8px;">Nenhuma lineup encontrada. Crie uma em "Minhas Lineups".</p>';
                return;
            }
            var html = '';
            lineups.forEach(function (l) {
                html +=
                    '<button class="lineup-option-btn" data-lineup-id="' + l.id_lineup + '">' +
                        '<span class="lineup-option-nome">' + l.nome + '</span>' +
                        '<span class="lineup-option-info">' + l.data_evento + ' · ' + l.qtd_artistas + ' artistas</span>' +
                    '</button>';
            });
            container.innerHTML = html;

            container.querySelectorAll('.lineup-option-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var lineupId = parseInt(this.getAttribute('data-lineup-id'));
                    adicionarNaLineup(lineupId, modal._artistaId);
                });
            });
        })
        .catch(function (e) {
            console.error('Erro ao carregar lineups:', e);
            document.getElementById('lista-lineups').innerHTML = '<p style="color:#999;font-size:13px;">Erro ao carregar lineups.</p>';
        });
}

function criarModalLineup() {
    var div = document.createElement('div');
    div.id = 'modal-adicionar-lineup';
    div.className = 'modal-fundo';
    div.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(26,10,46,0.6);z-index:1000;align-items:center;justify-content:center;';
    div.onclick = function (e) { if (e.target === this) fecharModalLineup(); };

    div.innerHTML =
        '<div class="modal-caixa" style="background:white;border-radius:16px;padding:24px 28px;width:440px;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(168,85,247,0.25);border:1.5px solid #e0d5f2;">' +
            '<div class="modal-cabecalho" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                '<h3 class="modal-titulo" style="font-family:Montserrat Alternates,sans-serif;font-size:18px;font-weight:700;color:#1A0A2E;">Adicionar à lineup</h3>' +
                '<button class="modal-fechar" onclick="fecharModalLineup()" style="background:none;border:none;font-size:16px;color:#aaa;cursor:pointer;line-height:1;">✕</button>' +
            '</div>' +
            '<div class="modal-corpo" style="display:flex;flex-direction:column;gap:12px;">' +
                '<p style="font-size:14px;color:#555;">Adicionar <strong id="modal-lineup-artista-nome">Artista</strong> a:</p>' +
                '<div id="lista-lineups" style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;"></div>' +
                '<div class="modal-acoes" style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">' +
                    '<button class="btn-cancelar" onclick="fecharModalLineup()" style="padding:8px 20px;border:1.5px solid #e0d5f2;border-radius:25px;background:white;color:#666;font-weight:600;font-size:13px;cursor:pointer;">Cancelar</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    var style = document.createElement('style');
    style.textContent =
        '.lineup-option-btn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:10px 14px;border:1.5px solid #e0d5f2;border-radius:10px;background:white;cursor:pointer;transition:all 0.2s;text-align:left;width:100%;}' +
        '.lineup-option-btn:hover{border-color:#A855F7;background:#f8f4ff;}' +
        '.lineup-option-nome{font-size:14px;font-weight:600;color:#1A0A2E;}' +
        '.lineup-option-info{font-size:11px;color:#999;}';
    document.head.appendChild(style);

    return div;
}

function fecharModalLineup() {
    var modal = document.getElementById('modal-adicionar-lineup');
    if (modal) modal.style.display = 'none';
}

async function adicionarNaLineup(lineupId, artistaId) {
    try {
        var response = await fetch('http://localhost:3333/lineups/' + lineupId + '/artistas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artistaId: artistaId })
        });
        if (!response.ok) throw new Error('Erro ' + response.status);
        fecharModalLineup();
        alert('Artista adicionado à lineup com sucesso!');
    } catch (e) {
        console.error('Erro ao adicionar artista na lineup:', e);
        alert('Erro ao adicionar artista. Tente novamente.');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModalLineup();
});
