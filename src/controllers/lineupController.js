var lineupModel = require("../models/lineupModel");

async function listar(req, res) {
    var usuarioId = req.query.usuario;

    if (!usuarioId) {
        return res.status(400).send("Parametro 'usuario' obrigatorio");
    }

    try {
        await lineupModel.atualizarStatusPorData();
        var resultado = await lineupModel.listar(usuarioId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao listar lineups! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function detalhes(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    var lineupId = id;

    try {
        var resultado = await lineupModel.listarPorId(lineupId);
        if (!resultado || resultado.length === 0) {
            return res.status(404).send("Lineup nao encontrada");
        }
        var lineup = {
            id: resultado[0].id_lineup,
            nome: resultado[0].nome,
            data_evento: resultado[0].data_evento,
            status: resultado[0].status,
            artistas: resultado[0].id ? resultado.map(function (r) {
                return {
                    id: r.id,
                    nome: r.nome,
                    genre: r.genre,
                    popularity: r.popularity
                };
            }) : []
        };
        var featuresResult = await lineupModel.getAggregatedFeatures(lineupId);
        lineup.features = (featuresResult && featuresResult.length > 0) ? featuresResult[0] : null;
        res.status(200).json(lineup);
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao buscar lineup! Erro: ", erro.sqlMessage);
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
        var resultado = await lineupModel.criar(nome, usuarioId, dataEvento, notificacao, emailSecundario);
        res.status(201).json({ id: resultado.insertId, nome: nome });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao criar lineup! Erro: ", erro.sqlMessage);
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
        var resultado = await lineupModel.atualizar(id, nome, dataEvento, notificacao, emailSecundario);
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Lineup nao encontrada");
        }
        res.status(200).json({ mensagem: "Lineup atualizada" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao atualizar lineup! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function adicionarArtista(req, res) {
    var lineupId = parseInt(req.params.id);
    var artistaId = parseInt(req.body.artistaId);

    if (isNaN(lineupId) || isNaN(artistaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    try {
        await lineupModel.adicionarArtista(lineupId, artistaId);
        res.status(200).json({ mensagem: "Artista adicionado a lineup" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao adicionar artista! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function removerArtista(req, res) {
    var lineupId = parseInt(req.params.id);
    var artistaId = parseInt(req.params.artistaId);

    if (isNaN(lineupId) || isNaN(artistaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    try {
        await lineupModel.removerArtista(lineupId, artistaId);
        res.status(200).json({ mensagem: "Artista removido da lineup" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao remover artista! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

async function deletar(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    try {
        var resultado = await lineupModel.deletar(id);
        if (resultado.affectedRows === 0) {
            return res.status(404).send("Lineup nao encontrada");
        }
        res.status(200).json({ mensagem: "Lineup deletada" });
    } catch (erro) {
        console.log(erro);
        console.log("\nHouve um erro ao deletar lineup! Erro: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    }
}

module.exports = {
    listar,
    detalhes,
    criar,
    atualizar,
    adicionarArtista,
    removerArtista,
    deletar
};
