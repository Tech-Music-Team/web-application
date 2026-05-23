var setlistModel = require("../models/setlistModel");

function listar(req, res) {
    var usuarioId = req.query.usuario;

    if (!usuarioId) {
        return res.status(400).send("Parametro 'usuario' obrigatorio");
    }

    setlistModel.atualizarSituacaoPorData()
        .then(function () {
            return setlistModel.listar(usuarioId);
        })
        .then(function (resultado) {
            console.log("Setlists retornadas: " + resultado.length);
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao listar setlists! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function detalhes(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    setlistModel.listarPorId(id)
        .then(function (resultado) {
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
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar setlist! Erro: ", erro.sqlMessage);
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

    setlistModel.criar(nome, usuarioId, dataEvento)
        .then(function (resultado) {
            console.log("Setlist criada com ID: " + resultado.insertId);
            res.status(201).json({ id: resultado.insertId, nome: nome });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao criar setlist! Erro: ", erro.sqlMessage);
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

    setlistModel.atualizar(id, nome, dataEvento)
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).send("Setlist nao encontrada");
            }
            console.log("Setlist " + id + " atualizada");
            res.status(200).json({ mensagem: "Setlist atualizada" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao atualizar setlist! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletar(req, res) {
    var id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
        return res.status(400).send("ID invalido");
    }

    setlistModel.deletar(id)
        .then(function (resultado) {
            if (resultado.affectedRows === 0) {
                return res.status(404).send("Setlist nao encontrada");
            }
            console.log("Setlist " + id + " deletada");
            res.status(200).json({ mensagem: "Setlist deletada" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao deletar setlist! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function adicionarMusica(req, res) {
    var setlistId = parseInt(req.params.id);
    var musicaId = parseInt(req.body.musicaId);

    if (isNaN(setlistId) || isNaN(musicaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    setlistModel.adicionarMusica(setlistId, musicaId)
        .then(function (resultado) {
            console.log("Musica " + musicaId + " adicionada a setlist " + setlistId);
            res.status(200).json({ mensagem: "Musica adicionada a setlist" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao adicionar musica! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function removerMusica(req, res) {
    var setlistId = parseInt(req.params.id);
    var musicaId = parseInt(req.params.musicaId);

    if (isNaN(setlistId) || isNaN(musicaId)) {
        return res.status(400).send("Parametros invalidos");
    }

    setlistModel.removerMusica(setlistId, musicaId)
        .then(function (resultado) {
            console.log("Musica " + musicaId + " removida da setlist " + setlistId);
            res.status(200).json({ mensagem: "Musica removida da setlist" });
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao remover musica! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
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
