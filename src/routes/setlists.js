var express = require("express");
var router = express.Router();

var setlistController = require("../controllers/setlistController");

router.get("/", function (req, res) {
    setlistController.listar(req, res);
});

router.get("/:id", function (req, res) {
    setlistController.detalhes(req, res);
});

router.post("/", function (req, res) {
    setlistController.criar(req, res);
});

router.put("/:id", function (req, res) {
    setlistController.atualizar(req, res);
});

router.delete("/:id", function (req, res) {
    setlistController.deletar(req, res);
});

router.post("/:id/musicas", function (req, res) {
    setlistController.adicionarMusica(req, res);
});

router.delete("/:id/musicas/:musicaId", function (req, res) {
    setlistController.removerMusica(req, res);
});

module.exports = router;
