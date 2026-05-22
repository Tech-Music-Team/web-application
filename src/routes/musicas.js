var express = require("express");
var router = express.Router();

var musicaController = require("../controllers/musicaController");

router.get("/listar", function (req, res) {
    musicaController.listar(req, res);
});

router.get("/top", function (req, res) {
    musicaController.top(req, res);
});

router.get("/:id/detalhes", function (req, res) {
    musicaController.detalhes(req, res);
});

module.exports = router;
