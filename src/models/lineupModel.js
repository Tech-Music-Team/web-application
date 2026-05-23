var database = require("../database/config");

function listar(usuarioId) {
    var instrucao = `
        SELECT
            l.id_lineup,
            l.nome,
            DATE_FORMAT(l.data_evento, '%d/%m/%Y') AS data_evento,
            l.status,
            COUNT(al.fk_artista) AS qtd_artistas,
            COALESCE(ROUND(AVG(a.artist_popularity), 0), 0) AS avg_popularidade
        FROM lineup l
        LEFT JOIN artista_lineup al ON al.fk_lineup = l.id_lineup
        LEFT JOIN artista a ON a.id_artista = al.fk_artista
        WHERE l.fk_usuario = ${usuarioId}
        GROUP BY l.id_lineup, l.nome, l.data_evento, l.status
        ORDER BY l.data_evento DESC
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function listarPorId(id) {
    var instrucao = `
        SELECT
            l.id_lineup,
            l.nome,
            DATE_FORMAT(l.data_evento, '%d/%m/%Y') AS data_evento,
            l.status,
            a.id_artista AS id,
            a.nome,
            a.artist_genre AS genre,
            a.artist_popularity AS popularity
        FROM lineup l
        LEFT JOIN artista_lineup al ON al.fk_lineup = l.id_lineup
        LEFT JOIN artista a ON a.id_artista = al.fk_artista
        WHERE l.id_lineup = ${id}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function criar(nome, usuarioId, dataEvento) {
    var instrucao = `
        INSERT INTO lineup (nome, fk_usuario, data_evento, status)
        VALUES ('${nome}', ${usuarioId}, '${dataEvento}', 'pendente')
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function adicionarArtista(lineupId, artistaId) {
    var instrucao = `
        INSERT INTO artista_lineup (fk_artista, fk_lineup)
        VALUES (${artistaId}, ${lineupId})
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function removerArtista(lineupId, artistaId) {
    var instrucao = `
        DELETE FROM artista_lineup
        WHERE fk_artista = ${artistaId} AND fk_lineup = ${lineupId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function atualizar(id, nome, dataEvento) {
    var instrucao = `
        UPDATE lineup
        SET nome = '${nome}', data_evento = '${dataEvento}'
        WHERE id_lineup = ${id}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function deletar(id) {
    var instrucao = `
        DELETE FROM lineup WHERE id_lineup = ${id}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function atualizarStatusPorData() {
    var instrucao = `
        UPDATE lineup
        SET status = 'realizado'
        WHERE data_evento < CURDATE() AND status = 'pendente'
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function getAggregatedFeatures(lineupId) {
    var instrucao = `
        SELECT
            COALESCE(ROUND(AVG(m.energy), 3), 0) as energy,
            COALESCE(ROUND(AVG(m.danceability), 3), 0) as danceability,
            COALESCE(ROUND(AVG(m.valence), 3), 0) as valence,
            COALESCE(ROUND(AVG(m.loudness), 2), 0) as loudness,
            COALESCE(ROUND(AVG(m.speechiness), 3), 0) as speechiness,
            COALESCE(ROUND(AVG(m.instrumentalness), 3), 0) as instrumentalness
        FROM artista_lineup al
        LEFT JOIN musica m ON m.fk_artista = al.fk_artista
        WHERE al.fk_lineup = ${lineupId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listar,
    listarPorId,
    criar,
    atualizar,
    atualizarStatusPorData,
    adicionarArtista,
    removerArtista,
    deletar,
    getAggregatedFeatures
};
