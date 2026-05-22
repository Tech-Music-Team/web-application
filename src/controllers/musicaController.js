var musicaModel = require("../models/musicaModel");

function listar(req, res) {
  musicaModel
    .listar()
    .then(function (resultado) {
      console.log(`\nResultados encontrados: ${resultado.length}`);
      console.log(`Resultados: ${JSON.stringify(resultado)}`);

      res.status(200).json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log(
        "\nHouve um erro ao listar as músicas! Erro: ",
        erro.sqlMessage,
      );
      res.status(500).json(erro.sqlMessage);
    });
}

function top(req, res) {
  var sortField = req.query.sort || 'track_popularity';
  var limit = parseInt(req.query.limit) || 10000;
  var offset = parseInt(req.query.offset) || 0;

  var validSorts = ['track_popularity', 'streams', 'views'];
  if (!validSorts.includes(sortField)) {
    return res.status(400).send("Sort invalido. Use: track_popularity, streams ou views");
  }

  musicaModel.getTop(sortField, limit, offset)
    .then(function (resultado) {
      console.log(`\nTop musicas retornado: ${resultado.length} resultados`);
      res.status(200).json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nHouve um erro ao buscar top musicas! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

function detalhes(req, res) {
  var id = parseInt(req.params.id);

  if (isNaN(id) || id < 1) {
    return res.status(400).send("ID invalido");
  }

  musicaModel.getDetalhes(id)
    .then(function (resultado) {
      if (!resultado || resultado.length === 0) {
        return res.status(404).send("Musica nao encontrada");
      }
      console.log(`\nDetalhes da musica ${id} encontrados`);
      res.status(200).json(resultado[0]);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("\nHouve um erro ao buscar detalhes! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
  listar,
  top,
  detalhes,
};
