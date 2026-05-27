var musicaModel = require("../models/musicaModel");

async function listar(req, res) {
  try {
    var resultado = await musicaModel.listar();
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao listar as músicas! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function top(req, res) {
  var sortField = req.query.sort || 'track_popularity';
  var limit = parseInt(req.query.limit) || 10000;
  var offset = parseInt(req.query.offset) || 0;

  var validSorts = ['track_popularity', 'streams', 'views'];
  if (!validSorts.includes(sortField)) {
    return res.status(400).send("Sort invalido. Use: track_popularity, streams ou views");
  }

  try {
    var resultado = await musicaModel.getTop(sortField, limit, offset);
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao buscar top musicas! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function detalhes(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  try {
    var resultado = await musicaModel.getDetalhes(id);
    if (!resultado || resultado.length === 0) {
      return res.status(404).send("Musica nao encontrada");
    }
    res.status(200).json(resultado[0]);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao buscar detalhes! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function search(req, res) {
  var query = req.query.q;
  var limit = parseInt(req.query.limit) || 10;

  if (!query || query.trim().length < 2) {
    return res.status(400).send("Termo de busca deve ter +2 caracteres");
  }

  if (limit > 50) limit = 50;

  try {
    var resultado = await musicaModel.search(query.trim(), limit);
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro na busca de musicas! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

module.exports = {
  listar,
  top,
  detalhes,
  search,
};
