var database = require("../database/config");

function listar(usuarioId) {
    var instrucao = `
        SELECT
            s.id_setlist,
            s.nome,
            DATE_FORMAT(s.data_evento, '%d/%m/%Y') AS data_evento,
            s.situacao AS situacao,
            COUNT(ms.fk_musica) AS qtd_musicas,
            COALESCE(ROUND(AVG(m.track_popularity), 0), 0) AS avg_popularidade
        FROM setlist s
        LEFT JOIN musica_setlist ms ON ms.fk_setlist = s.id_setlist
        LEFT JOIN musica m ON m.id_musica = ms.fk_musica
        WHERE s.fk_usuario = ${usuarioId}
        GROUP BY s.id_setlist, s.nome, s.data_evento, s.situacao
        ORDER BY s.data_evento DESC
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function listarPorId(id) {
    var instrucao = `
        SELECT
            s.id_setlist,
            s.nome,
            DATE_FORMAT(s.data_evento, '%d/%m/%Y') AS data_evento,
            s.situacao AS situacao,
            m.id_musica AS id,
            m.track,
            a.nome AS artista_nome,
            a.artist_genre AS genre,
            m.track_popularity AS popularity,
            m.streams,
            m.views,
            m.likes,
            m.danceability,
            m.valence,
            m.energy,
            m.instrumentalness,
            m.speechiness,
            m.loudness
        FROM setlist s
        LEFT JOIN musica_setlist ms ON ms.fk_setlist = s.id_setlist
        LEFT JOIN musica m ON m.id_musica = ms.fk_musica
        LEFT JOIN artista a ON a.id_artista = m.fk_artista
        WHERE s.id_setlist = ${id}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function criar(nome, usuarioId, dataEvento) {
    var instrucao = `
        INSERT INTO setlist (nome, fk_usuario, data_evento, situacao)
        VALUES ('${nome}', ${usuarioId}, '${dataEvento}', 'pendente')
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function atualizar(id, nome, dataEvento) {
    var instrucao = `
        UPDATE setlist
        SET nome = '${nome}', data_evento = '${dataEvento}'
        WHERE id_setlist = ${id}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function deletar(id) {
    var instrucao = `
        DELETE FROM setlist WHERE id_setlist = ${id}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function adicionarMusica(setlistId, musicaId) {
    var instrucao = `
        INSERT INTO musica_setlist (fk_musica, fk_setlist)
        VALUES (${musicaId}, ${setlistId})
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function removerMusica(setlistId, musicaId) {
    var instrucao = `
        DELETE FROM musica_setlist
        WHERE fk_musica = ${musicaId} AND fk_setlist = ${setlistId}
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function atualizarSituacaoPorData() {
    var instrucao = `
        UPDATE setlist
        SET situacao = 'realizado'
        WHERE data_evento < CURDATE() AND situacao = 'pendente'
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listar,
    listarPorId,
    criar,
    atualizar,
    deletar,
    adicionarMusica,
    removerMusica,
    atualizarSituacaoPorData
};
