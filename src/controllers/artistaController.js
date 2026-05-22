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

module.exports = {
  listar,
  ranking,
};
