var artistaModel = require("../models/artistaModel");

function listar(req, res) {
  artistaModel
    .listar()
    .then(function (resultado) {
      console.log(`\nResultados encontrados: ${resultado.length}`);
      console.log(`Resultados: ${JSON.stringify(resultado)}`);

      res.status(200).json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log(
        "\nHouve um erro ao listar os artistas! Erro: ",
        erro.sqlMessage,
      );
      res.status(500).json(erro.sqlMessage);
    });
}

function ranking(req, res) {
  var sortField = req.query.sort || 'artist_popularity';
  var limit = parseInt(req.query.limit) || 1000;
  var offset = parseInt(req.query.offset) || 0;
  var order = req.query.order || 'desc';

  var validSorts = ['artist_popularity', 'views', 'likes'];
  if (!validSorts.includes(sortField)) {
    return res.status(400).send("Sort invalido. Use: artist_popularity, views ou likes");
  }

  artistaModel
    .getRanking(sortField, limit, offset, order)
    .then(function (resultado) {
      console.log(`\nRanking retornado: ${resultado.length} artistas`);
      res.status(200).json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log(
        "\nHouve um erro ao buscar ranking! Erro: ",
        erro.sqlMessage,
      );
      res.status(500).json(erro.sqlMessage);
    });
}

function detalhar(req, res) {
  var id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json('ID inválido');
  }

  artistaModel.getById(id)
    .then(function (resultado) {
      if (resultado.length === 0) {
        return res.status(404).json('Artista não encontrado');
      }
      res.status(200).json(resultado[0]);
    })
    .catch(function (erro) {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

function audioMedia(req, res) {
  var id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json('ID inválido');
  }

  artistaModel.getAudioMedia(id)
    .then(function (resultado) {
      res.status(200).json(resultado[0]);
    })
    .catch(function (erro) {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

function search(req, res) {
  var query = req.query.q;
  var limit = parseInt(req.query.limit) || 10;

  if (!query || query.trim().length < 2) {
    return res.status(400).send("Termo de busca deve ter +2 caracteres");
  }

  if (limit > 50) limit = 50;

  artistaModel.search(query.trim(), limit)
    .then(function (resultado) {
      console.log(`\nResultados de busca: ${resultado.length} artistas`);
      res.status(200).json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nHouve um erro na busca! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

function perfil(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  artistaModel.getPerfil(id)
    .then(function (resultado) {
      if (!resultado || resultado.length === 0) {
        return res.status(404).send("Artista nao encontrado");
      }
      console.log(`\nPerfil do artista ${id} encontrado`);
      res.status(200).json(resultado[0]);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nHouve um erro ao buscar perfil! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

function musicas(req, res) {
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

  artistaModel.getMusicas(id, sort, limit, offset)
    .then(function (resultado) {
      console.log(`\nMusicas do artista ${id} retornadas: ${resultado.length}`);
      res.status(200).json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nHouve um erro ao buscar musicas! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

function features(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  artistaModel.getAudioFeatures(id)
    .then(function (resultado) {
      if (!resultado || resultado.length === 0) {
        return res.status(404).send("Artista nao encontrado");
      }
      console.log(`\nFeatures do artista ${id} encontradas`);
      res.status(200).json(resultado[0]);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nHouve um erro ao buscar features! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
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
