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
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fk_role INT NOT NULL,

    CONSTRAINT fk_role_usuario
        FOREIGN KEY (fk_role)
        REFERENCES roles(id_role)
);

-- TABELA LOG
CREATE TABLE log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    data_hora DATETIME NOT NULL,
    nivel VARCHAR(50),
    aplicacao VARCHAR(100),
    modulo VARCHAR(100),
    classe VARCHAR(100),
    mensagem VARCHAR(500)
);

-- TABELA SETLIST (lista de musicas do usuario)
CREATE TABLE setlist (
    id_setlist INT AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    data_evento DATE NOT NULL,
    situacao VARCHAR(20) DEFAULT 'pendente',
	notificacao BOOLEAN DEFAULT TRUE,
    email_secundario VARCHAR(100) DEFAULT NULL,
    fk_usuario INT NOT NULL,
    
    CONSTRAINT fk_setlist_usuario
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,
        
	CONSTRAINT pkComposta_setlist 
		PRIMARY KEY (id_setlist, fk_usuario)
);

-- TABELA LINEUP (lista de artistas do usuario)
CREATE TABLE lineup (
    id_lineup INT AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    data_evento DATE NOT NULL,
	notificacao BOOLEAN DEFAULT TRUE,
    email_secundario VARCHAR(100) DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    fk_usuario INT NOT NULL,
    
    CONSTRAINT fk_lineup_usuario
		FOREIGN KEY (fk_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,
        
    CONSTRAINT pkComposta_lineup 
		PRIMARY KEY (id_lineup , fk_usuario)
);

-- TABELA ASSOCIATIVA: musica → setlist
CREATE TABLE musica_setlist (
	fk_musica INT NOT NULL,
    fk_setlist INT NOT NULL,
    
    CONSTRAINT pkComposta_ms PRIMARY KEY (fk_musica, fk_setlist),
    
     CONSTRAINT fk_ms_musica
        FOREIGN KEY (fk_musica)
        REFERENCES musica(id_musica),

    CONSTRAINT fk_ms_setlist
        FOREIGN KEY (fk_setlist)
        REFERENCES setlist(id_setlist)
);

-- TABELA ASSOCIATIVA: artista → lineup
CREATE TABLE artista_lineup (
    fk_artista INT NOT NULL,
    fk_lineup INT NOT NULL,

    CONSTRAINT pkComposta_al PRIMARY KEY (fk_artista, fk_lineup),

    CONSTRAINT fk_al_artista
        FOREIGN KEY (fk_artista)
        REFERENCES artista(id_artista),

    CONSTRAINT fk_al_lineup
        FOREIGN KEY (fk_lineup)
        REFERENCES lineup(id_lineup)
);

-- JavaMail (Notificação)
CREATE TABLE javamail (
    id_java INT AUTO_INCREMENT PRIMARY KEY,
    data_hora_envio DATETIME DEFAULT NOW(),
    fk_usuario INT NOT NULL,
    fk_setlist INT,
    fk_lineup INT,
	
    CONSTRAINT fk_usuario_javamail
        FOREIGN KEY (fk_usuario)
        REFERENCES usuario(id_usuario),
        
	CONSTRAINT fk_setlist_javamail
		FOREIGN KEY(fk_setlist)
		REFERENCES setlist(id_setlist),
        
	CONSTRAINT fk_lineup_javamail
		FOREIGN KEY(fk_lineup)
		REFERENCES lineup(id_lineup)
);