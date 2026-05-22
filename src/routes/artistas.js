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

// Rota para ranking de artistas com sort e limit
router.get("/ranking", function (req, res) {
    artistaController.ranking(req, res);
});

// Rota para buscar artistas por nome (ANTES das rotas com :id)
router.get("/search", function (req, res) {
    artistaController.search(req, res);
});

// Rotas com parametro :id (devem vir DEPOIS das rotas especificas)
router.get("/:id/perfil", function (req, res) {
    artistaController.perfil(req, res);
});

router.get("/:id/musicas", function (req, res) {
    artistaController.musicas(req, res);
});

router.get("/:id/features", function (req, res) {
    artistaController.features(req, res);
});

module.exports = router;
