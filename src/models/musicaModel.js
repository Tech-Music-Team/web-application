var database = require("../database/config");

var CAMPOS_MUSICA_TOP_VALIDOS = ['m.track_popularity', 'm.streams', 'm.views', 'm.likes'];

function listar() {
    var instrucaoSql = `
        SELECT * FROM musica;
    `;
    return database.executar(instrucaoSql);
}

function getTop(sortField, limit, offset) {
    var campo = CAMPOS_MUSICA_TOP_VALIDOS.includes(sortField) ? sortField : 'm.track_popularity';

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
        ORDER BY ${campo} DESC
        LIMIT ? OFFSET ?
    `;
    return database.executar(instrucao, [parseInt(limit), parseInt(offset)]);
}

function getDetalhes(musicaId) {
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
        WHERE m.id_musica = ?
    `;
    return database.executar(instrucao, [musicaId]);
}

function search(searchTerm, limit) {
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
        WHERE m.track LIKE ? OR a.nome LIKE ?
        ORDER BY m.track_popularity DESC
        LIMIT ?
    `;
    return database.executar(instrucao, ['%' + searchTerm + '%', '%' + searchTerm + '%', parseInt(limit)]);
}

module.exports = {
    listar,
    getTop,
    getDetalhes,
    search
};
