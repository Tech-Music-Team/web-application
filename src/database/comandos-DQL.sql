USE tech_music;

-- Top músicas por popularidade
SELECT track, track_popularity
FROM musica
ORDER BY track_popularity DESC;

-- Top músicas por popularidade
SELECT p.nome AS playlist, m.track
FROM playlist p
JOIN musica_playlist mp ON mp.fk_playlist = p.id_playlist
JOIN musica m ON m.id_musica = mp.fk_musica;

-- Playlist com músicas
SELECT a.nome, AVG(m.energy) AS media_energy
FROM artista a
JOIN musica m ON m.fk_artista = a.id_artista
GROUP BY a.nome;

SELECT * from usuario;