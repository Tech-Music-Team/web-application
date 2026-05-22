DROP DATABASE IF EXISTS tech_music;
CREATE DATABASE tech_music;
USE tech_music;

CREATE TABLE artista (
    id_artista INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    views BIGINT DEFAULT 0,
    artist_popularity INT,
    likes BIGINT DEFAULT 0,
    artist_followers BIGINT DEFAULT 0,
    artist_genre VARCHAR(100)
);

-- TABELA MUSICA
CREATE TABLE musica (
    id_musica INT AUTO_INCREMENT PRIMARY KEY,

    id_track VARCHAR(100) UNIQUE,
    fk_artista INT,

    streams BIGINT,
    title VARCHAR(100),      -- nome no YouTube
    track VARCHAR(100),      -- nome no Spotify
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    comments BIGINT DEFAULT 0,

    -- FEATURES DE ÁUDIO (0 até 1)
    danceability DECIMAL(4,3),
    valence DECIMAL(4,3),
    energy DECIMAL(4,3),
    instrumentalness DECIMAL(4,3),
    speechiness DECIMAL(4,3),

    -- LOUDNESS
    loudness DECIMAL(5,3),

    -- Popularidade (0 até 100)
    track_popularity INT,

    CONSTRAINT fk_musica_artista
        FOREIGN KEY (fk_artista)
        REFERENCES artista(id_artista)
);

-- TABELA DE ROLES
CREATE TABLE roles (
    id_role INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

-- TABELA USUARIO
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    fk_role INT NOT NULL,

    CONSTRAINT fk_role_usuario
        FOREIGN KEY (fk_role)
        REFERENCES roles(id_role)
);

-- TABELA LOG
CREATE TABLE log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    fk_usuario INT,

    data_hora DATETIME NOT NULL,
    nivel VARCHAR(50),
    aplicacao VARCHAR(100),
    modulo VARCHAR(100),
    classe VARCHAR(100),
    mensagem VARCHAR(500),

    CONSTRAINT fk_log_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE SET NULL
);

-- TABELA PLAYLIST (FRACA)
CREATE TABLE playlist (
    id_playlist INT AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    fk_usuario INT NOT NULL,

    CONSTRAINT fk_playlist_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
        
	CONSTRAINT pkComposta_playlist 
		PRIMARY KEY (id_playlist, fk_usuario)
);

-- TABELA PLAYLIST (FRACA)
CREATE TABLE setlist (
    id_setlist INT AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    fk_usuario INT NOT NULL,
    
    CONSTRAINT fk_setlist_usuario
		FOREIGN KEY (fk_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,
        
    CONSTRAINT pkComposta_setlist 
		PRIMARY KEY (id_setlist , fk_usuario)
);

-- TABELA ASSOCIATIVA
CREATE TABLE artista_setlist(
	fk_artista INT NOT NULL,
    fk_setlist INT NOT NULL,
    
    CONSTRAINT pkComposta_as PRIMARY KEY (fk_artista, fk_setlist),
    
     CONSTRAINT fk_as_artista
        FOREIGN KEY (fk_artista)
        REFERENCES artista(id_artista),

    CONSTRAINT fk_as_setlist
        FOREIGN KEY (fk_setlist)
        REFERENCES setlist(id_setlist)
);

-- TABELA ASSOCIATIVA
CREATE TABLE musica_playlist (
    fk_musica INT NOT NULL,
    fk_playlist INT NOT NULL,

    CONSTRAINT pkComposta_mp PRIMARY KEY (fk_musica, fk_playlist),

    CONSTRAINT fk_mp_musica
        FOREIGN KEY (fk_musica)
        REFERENCES musica(id_musica),

    CONSTRAINT fk_mp_playlist
        FOREIGN KEY (fk_playlist)
        REFERENCES playlist(id_playlist)
);

