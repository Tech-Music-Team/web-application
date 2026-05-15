var express = require("express");
var router = express.Router();

var artistaController = require("../controllers/artistaController");

router.get("/listar", function (req, res) {
    artistaController.listar(req, res);
});

module.exports = router;
