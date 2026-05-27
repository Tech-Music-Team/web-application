var artistaModel = require("../models/artistaModel");

async function listar(req, res) {
  try {
    var resultado = await artistaModel.listar();
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao listar os artistas! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function ranking(req, res) {
  var sortField = req.query.sort || 'artist_popularity';
  var limit = parseInt(req.query.limit) || 1000;
  var offset = parseInt(req.query.offset) || 0;
  var order = req.query.order || 'desc';

  var validSorts = ['artist_popularity', 'views', 'likes'];
  if (!validSorts.includes(sortField)) {
    return res.status(400).send("Sort invalido. Use: artist_popularity, views ou likes");
  }

  try {
    var resultado = await artistaModel.getRanking(sortField, limit, offset, order);
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao buscar ranking! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function detalhar(req, res) {
  var id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json('ID inválido');
  }

  try {
    var resultado = await artistaModel.getById(id);
    if (resultado.length === 0) {
      return res.status(404).json('Artista não encontrado');
    }
    res.status(200).json(resultado[0]);
  } catch (erro) {
    console.log(erro);
    res.status(500).json(erro.sqlMessage);
  }
}

async function audioMedia(req, res) {
  var id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json('ID inválido');
  }

  try {
    var resultado = await artistaModel.getAudioMedia(id);
    if (!resultado || resultado.length === 0) {
      return res.status(404).json('Artista não encontrado');
    }
    res.status(200).json(resultado[0]);
  } catch (erro) {
    console.log(erro);
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
    var resultado = await artistaModel.search(query.trim(), limit);
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro na busca! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function perfil(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  try {
    var resultado = await artistaModel.getPerfil(id);
    if (!resultado || resultado.length === 0) {
      return res.status(404).send("Artista nao encontrado");
    }
    res.status(200).json(resultado[0]);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao buscar perfil! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function musicas(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  var sort = req.query.sort || 'track_popularity';
  var limit = parseInt(req.query.limit) || 50;
  var offset = parseInt(req.query.offset) || 0;

  var validSorts = ['track_popularity', 'streams', 'views', 'likes'];
  if (!validSorts.includes(sort)) {
    return res.status(400).send("Sort invalido. Use: track_popularity, streams, views ou likes");
  }

  if (limit > 500) limit = 500;

  try {
    var resultado = await artistaModel.getMusicas(id, sort, limit, offset);
    res.status(200).json(resultado);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao buscar musicas! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

async function features(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  try {
    var resultado = await artistaModel.getAudioFeatures(id);
    if (!resultado || resultado.length === 0) {
      return res.status(404).send("Artista nao encontrado");
    }
    res.status(200).json(resultado[0]);
  } catch (erro) {
    console.log(erro);
    console.log("\nHouve um erro ao buscar features! Erro: ", erro.sqlMessage);
    res.status(500).json(erro.sqlMessage);
  }
}

module.exports = {
  listar,
  ranking,
  detalhar,
  audioMedia,
  search,
  perfil,
  musicas,
  features,
};
