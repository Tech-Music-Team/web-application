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

// NOVA ROTA: Ranking de artistas com sort e limit
router.get("/ranking", function (req, res) {
    artistaController.ranking(req, res);
});

router.get("/:id/audio", function (req, res) {
    artistaController.audioMedia(req, res);
});

router.get("/:id", function (req, res) {
    artistaController.detalhar(req, res);
});

module.exports = router;
