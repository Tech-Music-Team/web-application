USE tech_music;

-- Top músicas por popularidade
SELECT track, track_popularity
FROM musica
ORDER BY track_popularity DESC;

-- Setlists com suas músicas
SELECT s.nome AS setlist, m.track
FROM setlist s
JOIN musica_setlist ms ON ms.fk_setlist = s.id_setlist
JOIN musica m ON m.id_musica = ms.fk_musica;

-- Lineups com seus artistas
SELECT l.nome AS lineup, a.nome AS artista
FROM lineup l
JOIN artista_lineup al ON al.fk_lineup = l.id_lineup
JOIN artista a ON a.id_artista = al.fk_artista;

-- Média de features por artista
SELECT a.nome, AVG(m.energy) AS media_energy
FROM artista a
JOIN musica m ON m.fk_artista = a.id_artista
GROUP BY a.nome;

SELECT * from usuario;