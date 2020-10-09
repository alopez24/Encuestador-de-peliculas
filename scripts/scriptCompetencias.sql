USE competencias;
DROP TABLE IF EXISTS competencia;

CREATE TABLE competencia (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
);

USE competencias;
DROP TABLE IF EXISTS voto;

CREATE TABLE voto (
  id INT NOT NULL AUTO_INCREMENT,
  pelicula_id int(11) unsigned NOT NULL,
  competencia_id INT NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE voto add FOREIGN KEY (pelicula_id) REFERENCES pelicula(id);

ALTER TABLE voto add FOREIGN KEY (competencia_id) REFERENCES competencia(id);

ALTER TABLE competencia ADD COLUMN genero_id INT (11) UNSIGNED, ADD FOREIGN KEY (genero_id) REFERENCES genero(id);

ALTER TABLE competencia ADD COLUMN director_id INT (11) UNSIGNED, ADD FOREIGN KEY (director_id) REFERENCES director(id);

ALTER TABLE competencia ADD COLUMN actor_id INT (11) UNSIGNED, ADD FOREIGN KEY (actor_id) REFERENCES actor(id);

INSERT INTO competencia (nombre) VALUES ('¿Cual consideras como la mejor película?'), ('Con que drama lloraste mas?'), ('¿Cual es la película mas pochoclera?'), ('¿Con que comedia te reiste más?'), ('¿Cual pelicula es mejor para un dia de lluvia?'), ('¿Qué film de terror fue el que te asusto mas?'), ('¿Cuál es el mejor thriller?');
