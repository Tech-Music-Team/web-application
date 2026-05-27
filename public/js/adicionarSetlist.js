function adicionarASetlist(musicaId, musicaNome) {
    var usuarioId = getUsuarioId();
    if (!usuarioId) {
        alert('Usuário não autenticado.');
        return;
    }

    var modal = document.getElementById('modal-adicionar-setlist');
    if (!modal) {
        modal = criarModalSetlist();
        document.body.appendChild(modal);
    }

    modal._musicaId = musicaId;
    document.getElementById('modal-setlist-musica-nome').textContent = musicaNome || 'Música';
    document.getElementById('lista-setlists').innerHTML = '<p style="color:#999;font-size:13px;">Carregando playlists...</p>';
    modal.style.display = 'flex';

    fetch('/setlists?usuario=' + usuarioId)
        .then(function (r) { return r.json(); })
        .then(function (setlists) {
            var container = document.getElementById('lista-setlists');
            if (!setlists || setlists.length === 0) {
                container.innerHTML = '<p style="color:#999;font-size:13px;padding:8px;">Nenhuma playlist encontrada. Crie uma em "Minhas playlists".</p>';
                return;
            }
            var html = '';
            setlists.forEach(function (s) {
                html +=
                    '<button class="lineup-option-btn" data-setlist-id="' + s.id_setlist + '">' +
                        '<span class="lineup-option-nome">' + s.nome + '</span>' +
                        '<span class="lineup-option-info">' + s.qtd_musicas + ' músicas · pop. ' + s.avg_popularidade + '</span>' +
                    '</button>';
            });
            container.innerHTML = html;

            container.querySelectorAll('.lineup-option-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var setlistId = parseInt(this.getAttribute('data-setlist-id'));
                    adicionarNaSetlist(setlistId, modal._musicaId);
                });
            });
        })
        .catch(function (e) {
            console.error('Erro ao carregar playlists:', e);
            document.getElementById('lista-setlists').innerHTML = '<p style="color:#999;font-size:13px;">Erro ao carregar playlists.</p>';
        });
}

function criarModalSetlist() {
    var div = document.createElement('div');
    div.id = 'modal-adicionar-setlist';
    div.className = 'modal-fundo';
    div.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(26,10,46,0.6);z-index:1000;align-items:center;justify-content:center;';
    div.onclick = function (e) { if (e.target === this) fecharModalSetlist(); };

    div.innerHTML =
        '<div class="modal-caixa" style="background:white;border-radius:16px;padding:24px 28px;width:440px;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(168,85,247,0.25);border:1.5px solid #e0d5f2;">' +
            '<div class="modal-cabecalho" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                '<h3 class="modal-titulo" style="font-family:Montserrat Alternates,sans-serif;font-size:18px;font-weight:700;color:#1A0A2E;">Adicionar à playlist</h3>' +
                '<button class="modal-fechar" onclick="fecharModalSetlist()" style="background:none;border:none;font-size:16px;color:#aaa;cursor:pointer;line-height:1;">✕</button>' +
            '</div>' +
            '<div class="modal-corpo" style="display:flex;flex-direction:column;gap:12px;">' +
                '<p style="font-size:14px;color:#555;">Adicionar <strong id="modal-setlist-musica-nome">Música</strong> a:</p>' +
                '<div id="lista-setlists" style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;"></div>' +
                '<div class="modal-acoes" style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">' +
                    '<button class="btn-cancelar" onclick="fecharModalSetlist()" style="padding:8px 20px;border:1.5px solid #e0d5f2;border-radius:25px;background:white;color:#666;font-weight:600;font-size:13px;cursor:pointer;">Cancelar</button>' +
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

function fecharModalSetlist() {
    var modal = document.getElementById('modal-adicionar-setlist');
    if (modal) modal.style.display = 'none';
}

async function adicionarNaSetlist(setlistId, musicaId) {
    try {
        var response = await fetch('/setlists/' + setlistId + '/musicas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ musicaId: musicaId })
        });
        if (!response.ok) throw new Error('Erro ' + response.status);
        fecharModalSetlist();
        alert('Música adicionada à playlist com sucesso!');
    } catch (e) {
        console.error('Erro ao adicionar música na playlist:', e);
        alert('Erro ao adicionar música. Tente novamente.');
    }
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModalSetlist();
});
