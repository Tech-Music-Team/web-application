var setlistModel = require("../models/setlistModel");

async function listar(req, res) {
    var usuarioId = req.query.usuario;

    if (!usuarioId) {
        return res.status(400).send("Parametro 'usuario' obrigatorio");
    }

    try {
        await setlistModel.atualizarSituacaoPorData();
        var resultado = await setlistModel.listar(usuarioId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao listar setlists! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function detalhes(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    try {
        var resultado = await setlistModel.listarPorId(id);
        if (!resultado || resultado.length === 0) {
            return res.status(404).send("Setlist nao encontrada");
        }
        var setlist = {
            id: resultado[0].id_setlist,
            nome: resultado[0].nome,
            data_evento: resultado[0].data_evento,
            situacao: resultado[0].situacao,
            musicas: resultado[0].id ? resultado.map(function (r) {
                return {
                    id: r.id,
                    track: r.track,
                    artista_nome: r.artista_nome,
                    genre: r.genre,
                    popularity: r.popularity,
                    streams: r.streams,
                    views: r.views,
                    likes: r.likes,
                    danceability: r.danceability,
                    valence: r.valence,
                    energy: r.energy,
                    instrumentalness: r.instrumentalness,
                    speechiness: r.speechiness,
                    loudness: r.loudness
                };
            }) : []
        };
        res.status(200).json(setlist);
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao buscar setlist! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function criar(req, res) {
    var nome = req.body.nome;
    var usuarioId = req.body.usuario;
    var dataEvento = req.body.dataEvento;
    var notificacao = req.body.notificacao !== undefined ? (req.body.notificacao ? 1 : 0) : 1;
    var emailSecundario = req.body.emailSecundario || null;

    if (!nome || !usuarioId || !dataEvento) {
        return res.status(400).send("Campos 'nome', 'usuario' e 'dataEvento' obrigatorios");
    }

    var hoje = new Date();
    var dataFormatada = hoje.toISOString().split('T')[0];
    if (dataEvento < dataFormatada) {
        return res.status(400).send("A data do evento nao pode ser anterior a data atual");
    }

    if (emailSecundario && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSecundario)) {
        return res.status(400).send("Email secundario invalido");
    }

    try {
        var resultado = await setlistModel.criar(nome, usuarioId, dataEvento, notificacao, emailSecundario);
        res.status(201).json({ id: resultado.insertId, nome: nome });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao criar setlist! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function atualizar(req, res) {
    var id = parseInt(req.params.id);
    var nome = req.body.nome;
    var dataEvento = req.body.dataEvento;
    var notificacao = req.body.notificacao !== undefined ? (req.body.notificacao ? 1 : 0) : 1;
    var emailSecundario = req.body.emailSecundario || null;

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }
    if (!nome || !dataEvento) {
        return res.status(400).send("Campos 'nome' e 'dataEvento' obrigatorios");
    }

    var hoje = new Date();
    var dataFormatada = hoje.toISOString().split('T')[0];
    if (dataEvento < dataFormatada) {
        return res.status(400).send("A data do evento nao pode ser anterior a data atual");
    }

    if (emailSecundario && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailSecundario)) {
        return res.status(400).send("Email secundario invalido");
    }

    try {
        var resultado = await setlistModel.atualizar(id, nome, dataEvento, notificacao, emailSecundario);
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Setlist nao encontrada");
        }
        res.status(200).json({ mensagem: "Setlist atualizada" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao atualizar setlist! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function deletar(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    try {
        var resultado = await setlistModel.deletar(id);
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Setlist nao encontrada");
        }
        res.status(200).json({ mensagem: "Setlist deletada" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao deletar setlist! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function adicionarMusica(req, res) {
    var setlistId = parseInt(req.params.id);
    var musicaId = parseInt(req.body.musicaId);

    if (isNaN(setlistId) || isNaN(musicaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    try {
        await setlistModel.adicionarMusica(setlistId, musicaId);
        res.status(200).json({ mensagem: "Musica adicionada a setlist" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao adicionar musica! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function removerMusica(req, res) {
    var setlistId = parseInt(req.params.id);
    var musicaId = parseInt(req.params.musicaId);

    if (isNaN(setlistId) || isNaN(musicaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    try {
        await setlistModel.removerMusica(setlistId, musicaId);
        res.status(200).json({ mensagem: "Musica removida da setlist" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao remover musica! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

module.exports = {
    listar,
    detalhes,
    criar,
    atualizar,
    deletar,
    adicionarMusica,
    removerMusica
};
