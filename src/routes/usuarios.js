var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/:id", function (req, res) {
    usuarioController.perfil(req, res);
});

router.put("/:id", function (req, res) {
    usuarioController.atualizar(req, res);
});

router.delete("/:id", function (req, res) {
    usuarioController.deletar(req, res);
});

module.exports = router;