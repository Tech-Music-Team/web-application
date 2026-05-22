var database = require("../database/config");

function listar() {
    console.log("ACESSEI O MUSICA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listar():");

    var instrucaoSql = `
        SELECT * FROM musica;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getTop(sortField, limit, offset) {
    console.log("ACESSEI O MUSICA MODEL - getTop():");

    var instrucao = `
        SELECT 
            m.id_musica as id,
            m.track,
            a.nome as artist,
            a.artist_genre as genre,
            a.id_artista as artist_id,
            m.track_popularity as popularity,
            m.streams,
            m.views,
            m.likes
        FROM musica m
        JOIN artista a ON m.fk_artista = a.id_artista
        ORDER BY ${sortField} DESC
        LIMIT ${limit} OFFSET ${offset}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function getDetalhes(musicaId) {
    console.log("ACESSEI O MUSICA MODEL - getDetalhes():");

    var instrucao = `
        SELECT 
            m.id_musica as id,
            m.track,
            a.nome as artist,
            a.id_artista as artist_id,
            a.artist_genre as genre,
            m.track_popularity as popularity,
            m.streams,
            m.views,
            m.likes,
            m.comments,
            m.energy,
            m.danceability,
            m.valence,
            m.loudness,
            m.speechiness,
            m.instrumentalness
        FROM musica m
        JOIN artista a ON m.fk_artista = a.id_artista
        WHERE m.id_musica = ${musicaId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listar,
    getTop,
    getDetalhes
};
