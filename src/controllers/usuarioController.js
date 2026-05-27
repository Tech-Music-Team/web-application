var usuarioModel = require("../models/usuarioModel");

async function cadastrar(req, res) {
  var nome = req.body.nomeServer;
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;

  if (nome === undefined) {
    return res.status(400).send("Seu nome está undefined!");
  }
  if (email === undefined) {
    return res.status(400).send("Seu email está undefined!");
  }
  if (senha === undefined) {
    return res.status(400).send("Sua senha está undefined!");
  }

  try {
    var resultado = await usuarioModel.cadastrar(nome, email, senha);
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao realizar o cadastro! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function autenticar(req, res) {
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;

  if (email === undefined) {
    return res.status(400).send("Seu email está undefined!");
  }
  if (senha === undefined) {
    return res.status(400).send("Sua senha está undefined!");
  }

  try {
    var resultadoAutenticar = await usuarioModel.autenticar(email, senha);

    if (resultadoAutenticar.length === 1) {
      res.status(200).json({
        id: resultadoAutenticar[0].id,
        email: resultadoAutenticar[0].email,
        nome: resultadoAutenticar[0].nome,
        senha: resultadoAutenticar[0].senha,
      });
    } else if (resultadoAutenticar.length === 0) {
      res.status(403).send("Email e/ou senha inválido(s)");
    } else {
      res.status(403).send("Mais de um usuário com o mesmo login e senha!");
    }
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function perfil(req, res) {
    var id = parseInt(req.params.id);
    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    try {
        var resultado = await usuarioModel.getPerfil(id);
        if (!resultado || resultado.length === 0) {
            return res.status(404).send("Usuario nao encontrado");
        }
        res.status(200).json(resultado[0]);
    } catch (erro) {
        console.log(erro);
        res.status(500).json(erro.sqlMessage);
    }
}

async function atualizar(req, res) {
    var id = parseInt(req.params.id);
    var nome = req.body.nome;
    var senhaAtual = req.body.senhaAtual;
    var novaSenha = req.body.novaSenha;

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }
    if (!nome || nome.trim().length < 2) {
        return res.status(400).send("Nome invalido");
    }

    try {
        if (!novaSenha) {
            await usuarioModel.atualizar(id, nome.trim(), null);
            return res.status(200).json({ mensagem: "Nome atualizado" });
        }

        if (!senhaAtual) {
            return res.status(400).send("Informe a senha atual para alterar a senha");
        }

        var resultadoSenha = await usuarioModel.verificarSenha(id, senhaAtual);
        if (!resultadoSenha || resultadoSenha.length === 0) {
            return res.status(403).send("Senha atual incorreta");
        }

        await usuarioModel.atualizar(id, nome.trim(), novaSenha);
        res.status(200).json({ mensagem: "Senha atualizada" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json(erro.sqlMessage);
    }
}

async function deletar(req, res) {
    var id = parseInt(req.params.id);
    var senha = req.body.senha;

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }
    if (!senha) {
        return res.status(400).send("Informe a senha para confirmar");
    }

    try {
        var resultado = await usuarioModel.verificarSenha(id, senha);
        if (!resultado || resultado.length === 0) {
            return res.status(403).send("Senha incorreta");
        }
        await usuarioModel.deletar(id);
        res.status(200).json({ mensagem: "Conta excluida" });
    } catch (erro) {
        console.log(erro);
        res.status(500).json(erro.sqlMessage);
    }
}

module.exports = {
  cadastrar,
  autenticar,
  perfil,
  atualizar,
  deletar,
};
