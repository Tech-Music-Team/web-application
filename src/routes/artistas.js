var express = require("express");
var router = express.Router();

var artistaController = require("../controllers/artistaController");
var spotifyController = require("../controllers/spotifyController");

router.get("/listar", function (req, res) {
    artistaController.listar(req, res);
});

// Rota para obter imagem do artista via Spotify API
router.get("/spotify/imagem/:id", function (req, res) {
    spotifyController.obterImagemArtista(req, res);
});

module.exports = router;
