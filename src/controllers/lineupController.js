var lineupModel = require("../models/lineupModel");

function listar(req, res) {
    var usuarioId = req.query.usuario;

    if (!usuarioId) {
        return res.status(400).send("Parametro 'usuario' obrigatorio");
    }

    lineupModel.atualizarStatusPorData()
        .then(function () {
            return lineupModel.listar(usuarioId);
        })
        .then(function (resultado) {
            console.log("Lineups retornadas: " + resultado.length);
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao listar lineups! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function detalhes(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    var lineupId = id;

    lineupModel.listarPorId(lineupId)
        .then(function (resultado) {
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
            return lineupModel.getAggregatedFeatures(lineupId)
                .then(function (featuresResult) {
                    if (featuresResult && featuresResult.length > 0) {
                        lineup.features = featuresResult[0];
                    } else {
                        lineup.features = null;
                    }
                    res.status(200).json(lineup);
                });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar lineup! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function criar(req, res) {
    var nome = req.body.nome;
    var usuarioId = req.body.usuario;
    var dataEvento = req.body.dataEvento;

    if (!nome || !usuarioId || !dataEvento) {
        return res.status(400).send("Campos 'nome', 'usuario' e 'dataEvento' obrigatorios");
    }

    var hoje = new Date();
    var dataFormatada = hoje.toISOString().split('T')[0];
    if (dataEvento < dataFormatada) {
        return res.status(400).send("A data do evento nao pode ser anterior a data atual");
    }

    lineupModel.criar(nome, usuarioId, dataEvento)
        .then(function (resultado) {
            console.log("Lineup criada com ID: " + resultado.insertId);
            res.status(201).json({ id: resultado.insertId, nome: nome });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao criar lineup! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function atualizar(req, res) {
    var id = parseInt(req.params.id);
    var nome = req.body.nome;
    var dataEvento = req.body.dataEvento;

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

    lineupModel.atualizar(id, nome, dataEvento)
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).send("Lineup nao encontrada");
            }
            console.log("Lineup " + id + " atualizada");
            res.status(200).json({ mensagem: "Lineup atualizada" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao atualizar lineup! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function adicionarArtista(req, res) {
    var lineupId = parseInt(req.params.id);
    var artistaId = parseInt(req.body.artistaId);

    if (isNaN(lineupId) || isNaN(artistaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    lineupModel.adicionarArtista(lineupId, artistaId)
        .then(function (resultado) {
            console.log("Artista " + artistaId + " adicionado a lineup " + lineupId);
            res.status(200).json({ mensagem: "Artista adicionado a lineup" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao adicionar artista! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function removerArtista(req, res) {
    var lineupId = parseInt(req.params.id);
    var artistaId = parseInt(req.params.artistaId);

    if (isNaN(lineupId) || isNaN(artistaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    lineupModel.removerArtista(lineupId, artistaId)
        .then(function (resultado) {
            console.log("Artista " + artistaId + " removido da lineup " + lineupId);
            res.status(200).json({ mensagem: "Artista removido da lineup" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao remover artista! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletar(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    lineupModel.deletar(id)
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).send("Lineup nao encontrada");
            }
            console.log("Lineup " + id + " deletada");
            res.status(200).json({ mensagem: "Lineup deletada" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao deletar lineup! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
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
