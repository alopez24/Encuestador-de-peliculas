var con = require('../lib/conexionbd');

var controller = {

    //listo todas las competencias
    buscarCompetencias: function (req, res) {
        var sql = "SELECT * FROM competencia";
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(404).send("Hubo un error en la consulta");
            }
            res.send(JSON.stringify(resultado));

        });
    },

    //obtengo dos películas aleatorias para votar
    peliculaAleatoria: function (req, res) {
        var idCompetencia = req.params.id;
        var queryCompetencia = "SELECT nombre, genero_id, director_id, actor_id FROM competencia WHERE id = " + idCompetencia + ";";
        con.query(queryCompetencia, function(error, competencia, fields){
            if (error) { 
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }

            var queryPeliculas = "SELECT DISTINCT pelicula.id, poster, titulo, genero_id FROM pelicula LEFT JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id LEFT JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id WHERE 1 = 1";
            var genero = competencia[0].genero_id;
            var actor = competencia[0].actor_id;
            var director = competencia[0].director_id;
            var queryGenero = genero ? ' AND pelicula.genero_id = '  + genero : '';
            var queryActor = actor ? ' AND actor_pelicula.actor_id = ' + actor : '';
            var queryDirector = director ? ' AND director_pelicula.director_id = ' + director : '';
            var randomOrder = ' ORDER BY RAND() LIMIT 2';

            var query = queryPeliculas + queryGenero + queryActor + queryDirector + randomOrder;

            con.query(query, function(error, peliculas, fields){
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(500).send("Hubo un error en la consulta");
                }

               var response = {
                    'peliculas': peliculas,
                    'competencia': competencia[0].nombre
                };

                res.send(JSON.stringify(response));
            });
        });
    },

    //guardo el voto que recibo
    guardarVoto: function (req,res){
        var idCompetencia= req.params.idCompetencia;
        var idPelicula = req.body.idPelicula;
        var sql = "INSERT INTO voto (competencia_id, pelicula_id) values (" + idCompetencia + ", " + idPelicula + ")";
        
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
            var response = {
                'voto': resultado.insertId,
            };
            res.status(200).send(response);    
        });
    },

    //obtengo las 3 películas más votadas
    obtenerResultados: function (req,res){
        var idCompetencia = req.params.id; 
        var sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
        
        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }
    
            if (resultado.length === 0) {
                console.log("No se encontro ninguna competencia con este id");
                return res.status(404).send("No se encontro ninguna competencia con este id");
            }
    
            var competencia = resultado[0];
    
            var sql = "SELECT voto.pelicula_id, pelicula.poster, pelicula.titulo, COUNT(pelicula_id) As votos FROM voto INNER JOIN pelicula ON voto.pelicula_id = pelicula.id WHERE voto.competencia_id = " + idCompetencia + " GROUP BY voto.pelicula_id ORDER BY COUNT(pelicula_id) DESC LIMIT 3";
    
            con.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la consulta", error.message);
                    return res.status(500).send("Hubo un error en la consulta");
                }
    
                var response = {
                    'competencia': competencia.nombre,
                    'resultados': resultado
                };
               
                res.send(JSON.stringify(response));    
            });             
        });
    },
    
    //permitir la creación de una nueva competencia
    crearNuevaCompetencia: function (req, res){
        var nombreCompetencia = req.body.nombre;
        var generoCompentecia = req.body.genero;
     var directorCompetencia = req.body.director;
     var actorCompetencia = req.body.actor;
     var sqlCount = "select count(*) as contador from competencias.pelicula join (competencias.actor_pelicula,competencias.actor,competencias.director_pelicula,competencias.director,competencias.genero) on (actor_pelicula.pelicula_id = pelicula.id and actor_id = actor.id and director_pelicula.pelicula_id = pelicula.id and director_id = director.id and genero.id = pelicula.genero_id) where 1 = 1" 
     con.query("select * from competencias where nombre = " + nombreCompetencia,
    function (error, resultado, fields){
        if (resultado){
            console.log("Hubo un error en la consulta", resultado);
            return res.status(422).send("Error! Ya existe una competencia con ese nombre");
        }

        if (generoCompentecia  != 0) {
            sqlCount = sqlCount + " and genero_id = " + generoCompentecia;
        }
        if (actorCompetencia != 0) {
            sqlCount = sqlCount + " and actor_id = " + actorCompetencia;
        }
        if (directorCompetencia != 0){
            sqlCount = sqlCount + " and director_id = " + directorCompetencia;
        }

//Se chequea que la competencia a crear tenga al menos 2 peliculas para mostrar
        con.query(sqlCount, function(error, resultado, fields){ 
            if (resultado[0].contador < 2 || resultado[0].contador === undefined){
                return res.status(422).send("Hay menos de 2 peliculas para mostrar en esta Competencia - Genere una nueva competencia con otros filtros");  
            }
  
//Si no existe competencia y tiene peliculas para mostrar se crea la competencia            
            con.query("insert into competencias (nombre, genero_id, actor_id, director_id) values (?, ?, ?, ?)",
            [nombreCompetencia , generoCompentecia, actorCompetencia, directorCompetencia], function (error, resultado, fields){
                errores(error, res);
                res.send(JSON.stringify(resultado));
            })
        })
    })  
    },
        
        
    //eliminar votos
    eliminarVotos: function (req, res){
        var idCompetencia = req.params.id;
        var borrar = "DELETE FROM voto WHERE competencia_id = " + idCompetencia;
        con.query(borrar, function (error, resultado){
            if (error) {
                console.log("Error al eliminar votos", error.message);
                return res.status(500).send(error);
            }
            console.log("Competencia reiniciada id: " + idCompetencia);
            res.send(JSON.stringify(resultado));
        });
    },

    //recupero el nombre de la competencia
    nombreCompetencia: function (req, res){
        var nombreCompetencia = req.params.id;
        var query = "SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = " + nombreCompetencia;
        con.query(query, function(error, resultado){
            if (error) {
                console.log("Hubo un error en la consulta", error.message);
                return res.status(500).send("Hubo un error en la consulta");
            }

            var response = {
                'id': resultado,
                'nombre': resultado[0].nombre,
                'genero_nombre': resultado[0].genero,
                'actor_nombre': resultado[0].actor,
                'director_nombre': resultado[0].director
            }
            res.send(JSON.stringify(response));
        });
    },

    //creo competencias por género
    cargarGeneros: function (req,res){
        var pedido = "SELECT * FROM genero"
        con.query(pedido, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar géneros", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    },

    //creo competencias por director
    cargarDirectores: function (req,res){
        var pedido = "SELECT * FROM director"
        con.query(pedido, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar directores", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    },

    //creo competencias por actores
    cargarActores: function (req,res){
        var pedido = "SELECT * FROM actor"
        con.query(pedido, function (error, resultado, fields){
            if (error) {
                console.log("Error al cargar actores", error.message);
                return res.status(500).send(error);
            }
            res.send(JSON.stringify(resultado));
        });
    },

    //borro competencias
    eliminarCompetencia: function (req, res) {
        var idCompetencia = req.params.idCompetencia;
        console.log(idCompetencia) 
        let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
       console.log("ejecutando query",sql)
    
    con.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna competencia con este id");
            return res.status(404).send("No se encontro ninguna competencia con este id");
        }

        let sql = "DELETE FROM voto WHERE voto.competencia_id = " + idCompetencia;

        con.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la eliminacion de los votos", error.message);
                return res.status(500).send("Hubo un error en la eliminacion de los votos");
            }

            let sql = "DELETE FROM competencia WHERE id = " + idCompetencia;

            con.query(sql, function(error, resultado, fields) {
                if (error) {
                    console.log("Hubo un error en la eliminacion de la competencia", error.message);
                    return res.status(500).send("Hubo un error en la eliminacion de la competencia");
                }
    
                res.status(200).send();    
            });                
        });             
    });
},
               
    //edito las competencias
    editarCompetencia: function (req, res) {
        var idCompetencia = req.params.id;
        var nuevoNombre = req.body.nombre;
        var queryString = "UPDATE competencia SET nombre = '"+ nuevoNombre +"' WHERE id = "+ idCompetencia +";";
        
        con.query(queryString,function(error, resultado, fields){
            if(error){
                return res.status(500).send("Error al modificar la competencia")
            }
            if (resultado.length == 0){
                console.log("No se encontro la pelicula buscada con ese id");
                return res.status(404).send("No se encontro ninguna pelicula con ese id");
            } else {
                var response = {
                    'id': resultado
                };
            }
            res.send(JSON.stringify(response));
        });
    }
};

module.exports = controller;