USE tech_music;

INSERT INTO roles (nome) VALUES
('ADMIN'),
('USER'),
('JAVALOG');

INSERT INTO usuario (email, nome, senha, fk_role) VALUES
('java@email.com', 'Java', 'ADMINJAVA', 3);

INSERT INTO usuario (email, nome, senha, fk_role) VALUES
('alexandre@email.com', 'Alexandre Donisete', '12345', 1);

INSERT INTO usuario (email, nome, senha, fk_role) VALUES
('jorge@email.com', 'Jorge', '12345', 2);