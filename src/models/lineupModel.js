var database = require("../database/config");

function listar(usuarioId) {
    var instrucao = `
        SELECT
            l.id_lineup,
            l.nome,
            DATE_FORMAT(l.data_evento, '%d/%m/%Y') AS data_evento,
            l.status,
            l.notificacao,
            l.email_secundario,
            COUNT(al.fk_artista) AS qtd_artistas,
            COALESCE(ROUND(AVG(a.artist_popularity), 0), 0) AS avg_popularidade
        FROM lineup l
        LEFT JOIN artista_lineup al ON al.fk_lineup = l.id_lineup
        LEFT JOIN artista a ON a.id_artista = al.fk_artista
        WHERE l.fk_usuario = ?
        GROUP BY l.id_lineup, l.nome, l.data_evento, l.status, l.notificacao, l.email_secundario
        ORDER BY l.data_evento DESC
    `;
    return database.executar(instrucao, [usuarioId]);
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
        WHERE l.id_lineup = ?
    `;
    return database.executar(instrucao, [id]);
}

function criar(nome, usuarioId, dataEvento, notificacao, emailSecundario) {
    var instrucao = `INSERT INTO lineup (nome, fk_usuario, data_evento, status, notificacao, email_secundario) VALUES (?, ?, ?, 'pendente', ?, ?)`;
    return database.executar(instrucao, [nome, usuarioId, dataEvento, notificacao, emailSecundario]);
}

function adicionarArtista(lineupId, artistaId) {
    var instrucao = `
        INSERT INTO artista_lineup (fk_artista, fk_lineup)
        VALUES (?, ?)
    `;
    return database.executar(instrucao, [artistaId, lineupId]);
}

function removerArtista(lineupId, artistaId) {
    var instrucao = `
        DELETE FROM artista_lineup
        WHERE fk_artista = ? AND fk_lineup = ?
    `;
    return database.executar(instrucao, [artistaId, lineupId]);
}

function atualizar(id, nome, dataEvento, notificacao, emailSecundario) {
    var instrucao = `UPDATE lineup SET nome = ?, data_evento = ?, notificacao = ?, email_secundario = ? WHERE id_lineup = ?`;
    return database.executar(instrucao, [nome, dataEvento, notificacao, emailSecundario, id]);
}

function deletar(id) {
    var instrucao = `
        DELETE FROM lineup WHERE id_lineup = ?
    `;
    return database.executar(instrucao, [id]);
}

function atualizarStatusPorData() {
    var instrucao = `
        UPDATE lineup
        SET status = 'realizado'
        WHERE data_evento < CURDATE() AND status = 'pendente'
    `;
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
        WHERE al.fk_lineup = ?
    `;
    return database.executar(instrucao, [lineupId]);
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
