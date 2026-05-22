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

function search(searchTerm, limit) {
    console.log("ACESSEI O ARTISTA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function search():");

    var instrucaoSql = `
        SELECT
            id_artista as id,
            nome,
            artist_genre as genre,
            artist_popularity as popularity
        FROM artista
        WHERE nome LIKE '%${searchTerm}%'
        ORDER BY artist_popularity DESC
        LIMIT ${limit}
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getPerfil(artistaId) {
    console.log("ACESSEI O ARTISTA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getPerfil():");

    var instrucaoSql = `
        SELECT
            id_artista as id,
            nome,
            artist_popularity as popularity,
            views,
            likes,
            artist_followers as followers,
            artist_genre as genre,
            (SELECT COUNT(*) FROM musica WHERE fk_artista = ${artistaId}) as totalMusicas
        FROM artista
        WHERE id_artista = ${artistaId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getMusicas(artistaId, sortField, limit, offset) {
    console.log("ACESSEI O ARTISTA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getMusicas():");

    var instrucaoSql = `
        SELECT
            id_musica as id,
            track,
            track_popularity as popularity,
            streams,
            views,
            likes
        FROM musica
        WHERE fk_artista = ${artistaId}
        ORDER BY ${sortField} DESC
        LIMIT ${limit} OFFSET ${offset}
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getAudioFeatures(artistaId) {
    console.log("ACESSEI O ARTISTA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getAudioFeatures():");

    var instrucaoSql = `
        SELECT
            ROUND(AVG(energy), 3) as energy,
            ROUND(AVG(danceability), 3) as danceability,
            ROUND(AVG(valence), 3) as valence,
            ROUND(AVG(loudness), 2) as loudness,
            ROUND(AVG(speechiness), 3) as speechiness,
            ROUND(AVG(instrumentalness), 3) as instrumentalness
        FROM musica
        WHERE fk_artista = ${artistaId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    listar,
    getRanking,
    search,
    getPerfil,
    getMusicas,
    getAudioFeatures
};
