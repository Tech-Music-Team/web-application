var express = require("express");
var router = express.Router();

var artistaController = require("../controllers/artistaController");
var spotifyController = require("../controllers/spotifyController");

router.get("/listar", function (req, res) {
    artistaController.listar(req, res);
});

router.get("/spotify/imagem/:id", function (req, res) {
    spotifyController.obterImagemArtista(req, res);
});

router.get("/spotify/buscar-imagem", function (req, res) {
    spotifyController.buscarImagemPorNome(req, res);
});

router.get("/ranking", function (req, res) {
    artistaController.ranking(req, res);
});

// /search ANTES das rotas com :id para evitar captura pelo param
router.get("/search", function (req, res) {
    artistaController.search(req, res);
});

// Rotas com :id vêm depois de todas as rotas fixas
router.get("/:id/audio", function (req, res) {
    artistaController.audioMedia(req, res);
});

router.get("/:id/perfil", function (req, res) {
    artistaController.perfil(req, res);
});

router.get("/:id/musicas", function (req, res) {
    artistaController.musicas(req, res);
});

router.get("/:id/features", function (req, res) {
    artistaController.features(req, res);
});

router.get("/:id", function (req, res) {
    artistaController.detalhar(req, res);
});

module.exports = router;
