var express = require("express");
var router = express.Router();

var musicaController = require("../controllers/musicaController");

router.get("/listar", function (req, res) {
    musicaController.listar(req, res);
});

module.exports = router;
