var usuarioId = null;
var usuarioNomeAtual = '';

document.addEventListener('DOMContentLoaded', function () {
    validarSessao();
    usuarioId = parseInt(sessionStorage.ID_USUARIO);
    carregarPerfil();
});

async function carregarPerfil() {
    try {
        var response = await fetch('/usuarios/' + usuarioId);
        if (!response.ok) throw new Error('Erro ' + response.status);
        var dados = await response.json();

        usuarioNomeAtual = dados.nome;
        document.getElementById('perfil-nome').textContent = dados.nome;
        document.getElementById('perfil-email').textContent = dados.email;
        document.getElementById('input-nome').value = dados.nome;
    } catch (e) {
        console.error('Erro ao carregar perfil:', e);
    }
}

async function salvarNome() {
    var nome = document.getElementById('input-nome').value.trim();
    var msg = document.getElementById('msg-nome');

    if (!nome || nome.length < 2) {
        mostrarMsg(msg, 'O nome deve ter pelo menos 2 caracteres.', 'erro');
        return;
    }

    try {
        var response = await fetch('/usuarios/' + usuarioId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome })
        });

        if (!response.ok) {
            var texto = await response.text();
            mostrarMsg(msg, texto || 'Erro ao salvar.', 'erro');
            return;
        }

        usuarioNomeAtual = nome;
        sessionStorage.NOME_USUARIO = nome;
        document.getElementById('perfil-nome').textContent = nome;
        document.getElementById('b_usuario').textContent = nome;
        mostrarMsg(msg, 'Nome atualizado com sucesso!', 'sucesso');
    } catch (e) {
        console.error('Erro ao salvar nome:', e);
        mostrarMsg(msg, 'Erro ao salvar. Tente novamente.', 'erro');
    }
}

async function salvarSenha() {
    var senhaAtual = document.getElementById('input-senha-atual').value;
    var novaSenha = document.getElementById('input-nova-senha').value;
    var confirmar = document.getElementById('input-confirmar-senha').value;
    var msg = document.getElementById('msg-senha');

    if (!senhaAtual) {
        mostrarMsg(msg, 'Informe sua senha atual.', 'erro');
        return;
    }
    if (!novaSenha || novaSenha.length < 4) {
        mostrarMsg(msg, 'A nova senha deve ter pelo menos 4 caracteres.', 'erro');
        return;
    }
    if (novaSenha !== confirmar) {
        mostrarMsg(msg, 'A confirmação não confere com a nova senha.', 'erro');
        return;
    }

    try {
        var response = await fetch('/usuarios/' + usuarioId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: usuarioNomeAtual,
                senhaAtual: senhaAtual,
                novaSenha: novaSenha
            })
        });

        if (!response.ok) {
            var texto = await response.text();
            mostrarMsg(msg, texto || 'Erro ao salvar.', 'erro');
            return;
        }

        document.getElementById('input-senha-atual').value = '';
        document.getElementById('input-nova-senha').value = '';
        document.getElementById('input-confirmar-senha').value = '';
        mostrarMsg(msg, 'Senha alterada com sucesso!', 'sucesso');
    } catch (e) {
        console.error('Erro ao salvar senha:', e);
        mostrarMsg(msg, 'Erro ao salvar. Tente novamente.', 'erro');
    }
}

function abrirModalExcluir() {
    document.getElementById('input-senha-excluir').value = '';
    document.getElementById('msg-excluir').style.display = 'none';
    document.getElementById('modal-excluir').style.display = 'flex';
    document.getElementById('input-senha-excluir').focus();
}

function fecharModalExcluir() {
    document.getElementById('modal-excluir').style.display = 'none';
}

async function confirmarExcluirConta() {
    var senha = document.getElementById('input-senha-excluir').value;
    var msg = document.getElementById('msg-excluir');

    if (!senha) {
        mostrarMsg(msg, 'Informe sua senha para confirmar.', 'erro');
        return;
    }

    try {
        var response = await fetch('/usuarios/' + usuarioId, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: senha })
        });

        if (!response.ok) {
            var texto = await response.text();
            mostrarMsg(msg, texto || 'Erro ao excluir conta.', 'erro');
            return;
        }

        sessionStorage.clear();
        window.location.href = '../login.html';
    } catch (e) {
        console.error('Erro ao excluir conta:', e);
        mostrarMsg(msg, 'Erro ao excluir conta. Tente novamente.', 'erro');
    }
}

function mostrarMsg(el, texto, tipo) {
    el.textContent = texto;
    el.className = 'msg-feedback ' + tipo;
    el.style.display = 'block';
    setTimeout(function () {
        el.style.display = 'none';
    }, 4000);
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fecharModalExcluir();
    if (e.key === 'Enter') {
        var modal = document.getElementById('modal-excluir');
        if (modal.style.display === 'flex') confirmarExcluirConta();
    }
});
