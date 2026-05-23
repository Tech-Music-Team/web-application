var express = require("express");
var router = express.Router();

var lineupController = require("../controllers/lineupController");

router.get("/", function (req, res) {
    lineupController.listar(req, res);
});

router.get("/:id", function (req, res) {
    lineupController.detalhes(req, res);
});

router.post("/", function (req, res) {
    lineupController.criar(req, res);
});

router.put("/:id", function (req, res) {
    lineupController.atualizar(req, res);
});

router.post("/:id/artistas", function (req, res) {
    lineupController.adicionarArtista(req, res);
});

router.delete("/:id/artistas/:artistaId", function (req, res) {
    lineupController.removerArtista(req, res);
});

router.delete("/:id", function (req, res) {
    lineupController.deletar(req, res);
});

module.exports = router;
