var database = require("../database/config");

function listar() {
    console.log("ACESSEI O ARTISTA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar():");

    var instrucaoSql = `
        SELECT * FROM artista;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getRanking(sortField, limit, offset, order) {
    console.log("ACESSEI O ARTISTA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getRanking():");

    var orderClause = order === 'asc' ? 'ASC' : 'DESC';

    var instrucaoSql = `
        SELECT 
            id_artista as id,
            nome,
            artist_genre as genre,
            artist_popularity as popularity,
            views,
            likes
        FROM artista
        ORDER BY ${sortField} ${orderClause}
        LIMIT ${limit} OFFSET ${offset}
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar,
    getRanking
};
