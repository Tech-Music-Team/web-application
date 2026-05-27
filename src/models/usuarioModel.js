var database = require("../database/config");

function cadastrar(nome, email, senha) {
  var instrucaoSql = `INSERT INTO usuario (email, nome, senha, fk_role) VALUES (?, ?, ?, 2)`;
  return database.executar(instrucaoSql, [email, nome, senha]);
}

function autenticar(email, senha) {
    var instrucaoSql = `SELECT id_usuario as id, nome, email, senha FROM usuario WHERE email = ? AND senha = ?`;
    return database.executar(instrucaoSql, [email, senha]);
}

function getPerfil(id) {
    var instrucao = `
        SELECT id_usuario as id, nome, email FROM usuario WHERE id_usuario = ?
    `;
    return database.executar(instrucao, [id]);
}

function atualizar(id, nome, novaSenha) {
    if (novaSenha) {
        var instrucao = `UPDATE usuario SET nome = ?, senha = ? WHERE id_usuario = ?`;
        return database.executar(instrucao, [nome, novaSenha, id]);
    }
    var instrucao = `UPDATE usuario SET nome = ? WHERE id_usuario = ?`;
    return database.executar(instrucao, [nome, id]);
}

function verificarSenha(id, senha) {
    var instrucao = `SELECT id_usuario FROM usuario WHERE id_usuario = ? AND senha = ?`;
    return database.executar(instrucao, [id, senha]);
}

function deletar(id) {
    var instrucao = `DELETE FROM usuario WHERE id_usuario = ?`;
    return database.executar(instrucao, [id]);
}

module.exports = {
  cadastrar,
  autenticar,
  getPerfil,
  atualizar,
  verificarSenha,
  deletar,
};
