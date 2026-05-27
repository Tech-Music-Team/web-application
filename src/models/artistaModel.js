var database = require("../database/config");

var CAMPOS_ARTISTA_VALIDOS = ['artist_popularity', 'views', 'likes', 'nome'];
var CAMPOS_MUSICA_VALIDOS = ['track_popularity', 'streams', 'views', 'likes'];

function listar() {
    var instrucaoSql = `
        SELECT * FROM artista;
    `;
    return database.executar(instrucaoSql);
}

function getRanking(sortField, limit, offset, order) {
    var campo = CAMPOS_ARTISTA_VALIDOS.includes(sortField) ? sortField : 'artist_popularity';
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
        ORDER BY ${campo} ${orderClause}
        LIMIT ? OFFSET ?
    `;
    return database.executar(instrucaoSql, [parseInt(limit), parseInt(offset)]);
}

function getById(id) {
    var instrucaoSql = `
        SELECT id_artista as id, nome, artist_genre as genre,
               artist_popularity as popularity, views, likes, artist_followers as followers,
               (SELECT COUNT(*) FROM musica WHERE fk_artista = ?) as totalMusicas
        FROM artista WHERE id_artista = ?;
    `;
    return database.executar(instrucaoSql, [id, id]);
}

function getAudioMedia(id) {
    var instrucaoSql = `
        SELECT
            COALESCE(AVG(danceability), 0) as danceability,
            COALESCE(AVG(energy), 0) as energy,
            COALESCE(AVG(valence), 0) as valence,
            COALESCE(AVG(loudness), 0) as loudness,
            COALESCE(AVG(speechiness), 0) as speechiness,
            COALESCE(AVG(instrumentalness), 0) as instrumentalness,
            COUNT(*) as track_count
        FROM musica WHERE fk_artista = ?;
    `;
    return database.executar(instrucaoSql, [id]);
}

function search(searchTerm, limit) {
    var instrucaoSql = `
        SELECT
            id_artista as id,
            nome,
            artist_genre as genre,
            artist_popularity as popularity
        FROM artista
        WHERE nome LIKE ?
        ORDER BY artist_popularity DESC
        LIMIT ?
    `;
    return database.executar(instrucaoSql, ['%' + searchTerm + '%', parseInt(limit)]);
}

function getPerfil(artistaId) {
    var instrucaoSql = `
        SELECT
            id_artista as id,
            nome,
            artist_popularity as popularity,
            views,
            likes,
            artist_followers as followers,
            artist_genre as genre,
            (SELECT COUNT(*) FROM musica WHERE fk_artista = ?) as totalMusicas
        FROM artista
        WHERE id_artista = ?
    `;
    return database.executar(instrucaoSql, [artistaId, artistaId]);
}

function getMusicas(artistaId, sortField, limit, offset) {
    var campo = CAMPOS_MUSICA_VALIDOS.includes(sortField) ? sortField : 'track_popularity';

    var instrucaoSql = `
        SELECT
            id_musica as id,
            track,
            track_popularity as popularity,
            streams,
            views,
            likes
        FROM musica
        WHERE fk_artista = ?
        ORDER BY ${campo} DESC
        LIMIT ? OFFSET ?
    `;
    return database.executar(instrucaoSql, [artistaId, parseInt(limit), parseInt(offset)]);
}

function getAudioFeatures(artistaId) {
    var instrucaoSql = `
        SELECT
            ROUND(AVG(energy), 3) as energy,
            ROUND(AVG(danceability), 3) as danceability,
            ROUND(AVG(valence), 3) as valence,
            ROUND(AVG(loudness), 2) as loudness,
            ROUND(AVG(speechiness), 3) as speechiness,
            ROUND(AVG(instrumentalness), 3) as instrumentalness
        FROM musica
        WHERE fk_artista = ?
    `;
    return database.executar(instrucaoSql, [artistaId]);
}

module.exports = {
    listar,
    getRanking,
    getById,
    getAudioMedia,
    search,
    getPerfil,
    getMusicas,
    getAudioFeatures
};
