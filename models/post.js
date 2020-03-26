/* import { 
  toLatLon, toLatitudeLongitude, headingDistanceTo, moveTo, insidePolygon 
} from 'geolocation-utils' */

const getAll = () => {
  return new Promise((resolve, reject) => {
    db.query("select * from posts", (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

const getById = pPostId => {
  return new Promise((resolve, reject) => {
    db.query("select * from posts where id = ?", [pPostId], (err, rows) => {
      if (err) reject(err);
      if (rows.lenght === 0) {
        resolve(null);
      }
      resolve(rows[0]);
    });
  });
};

// Busca los datos básicos de las covers en función de parámetros opcionales.
//FALTA: filtrado opcional por fecha y ordenado en función de todo.
const getCovers = ({ likes, limit, offset, usuario }) => {
  return new Promise((resolve, reject) => {
    //Si no hay valor de likes se le da el valor 0
    likes = likes === null || likes === undefined || likes === "" ? 0 : likes;
    //si no se especifica límite o sobrepasa un máximo se asigna 10
    limit =
      limit === null || limit === undefined || limit === "" || limit > 10
        ? 10
        : limit;
    //si no se especifica límitese asigna 0
    offset =
      offset === null || offset === undefined || offset === "" ? 0 : offset;
    usuario =
      usuario === null || usuario === undefined || usuario === ""
        ? ""
        : `AND fk_usuario = ${usuario}`;

    db.query(
      `SELECT id,titulo,imagen,likes,fk_usuario,fecha_publicacion FROM posts WHERE fk_id_anterior IS NULL AND LIKES >=? ${usuario} AND publico='publico' LIMIT ? OFFSET ?`,
      [parseInt(likes), parseInt(limit), parseInt(offset)],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

//Cuenta el número de posts hijos de un post
const countChildren = id => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(*) FROM posts where fk_id_anterior = ?`,
      [id],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

//Encuentra los hijos de un post, con parámetros opcionales
//FALTA: filtrado opcional por fecha y ordenado en función de todo.
const findChildren = ({ id, likes, limit, offset, usuario }) => {
  return new Promise((resolve, reject) => {
    //Si no hay valor de likes se le da el valor 0
    likes = likes === null || likes === undefined || likes === "" ? 0 : likes;
    //si no se especifica límite o sobrepasa un máximo se asigna 10
    limit =
      limit === null || limit === undefined || limit === "" || limit > 10
        ? 10
        : limit;
    //si no se especifica límitese asigna 0
    offset =
      offset === null || offset === undefined || offset === "" ? 0 : offset;
    usuario =
      usuario === null || usuario === undefined || usuario === ""
        ? ""
        : `AND fk_usuario = ${usuario}`;
    db.query(
      `SELECT posts.id,posts.titulo,posts.imagen,posts.likes,posts.fk_usuario, posts.fecha_publicacion, usuarios.nombre FROM posts, usuarios WHERE fk_usuario = usuarios.id and fk_id_anterior = ? AND LIKES >=? AND posts.publico='publico' ${usuario} LIMIT ? OFFSET ?`,
      [parseInt(id), parseInt(likes), parseInt(limit), parseInt(offset)],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

const getFather = id => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, titulo, imagen, fk_id_anterior FROM posts WHERE id = ?",
      [id],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

//devuelve la columna de likes de un post
const getLikes = id => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT likes FROM posts WHERE id=?`, [id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

//Actualiza la columna likes en la tabla posts
const updateLikes = ({ postid }, { activo }) => {
  return new Promise((resolve, reject) => {
    let operacion = "+1";
    if (activo === "inactivo") {
      operacion = "-1";
    }
    db.query(
      `UPDATE posts SET likes=likes${operacion} WHERE id=?`,
      [postid],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

//Busca una coincidencia usuario-like en tbi_likes
const searchLike = ({ postid, userid }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM tbi_likes WHERE fk_post=? AND fk_usuario=?",
      [postid, userid],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

//Inserta una fila de like en la tbi_likes
const insertLike = ({ postid, userid }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tbi_likes (fk_usuario,fk_post,activo,fecha_voto) values (?,?,?,?)",
      [userid, postid, "activo", new Date()],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

//Actualiza la columna activo en la tbi_likes
const updateLike = ({ id, activo }) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE tbi_likes SET activo=? WHERE id=?`,
      [activo, id],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

//Devuelve los comentarios y autor de un post. Parámetros opcionales
const getComments = ({ id, limit, offset, usuario }) => {
  return new Promise((resolve, reject) => {
    //si no se especifica límite o sobrepasa un máximo se asigna 10
    limit =
      limit === null || limit === undefined || limit === "" || limit > 10
        ? 10
        : limit;
    //si no se especifica límitese asigna 0
    offset =
      offset === null || offset === undefined || offset === "" ? 0 : offset;
    usuario =
      usuario === null || usuario === undefined || usuario === ""
        ? ""
        : `AND fk_usuario = ${usuario}`;
    db.query(
      `SELECT tbi_comentarios.id,tbi_comentarios.contenido,tbi_comentarios.fk_usuario,tbi_comentarios.fk_post,tbi_comentarios.fecha_publicacion, usuarios.nombre FROM tbi_comentarios, usuarios WHERE fk_usuario = usuarios.id and fk_post = ? ${usuario} ORDER BY tbi_comentarios.fecha_publicacion DESC LIMIT ? OFFSET ? `,
      [id, parseInt(limit), parseInt(offset)],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
};

const createComment = ({ fk_usuario, fk_post, contenido }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO tbi_comentarios (fk_usuario, fk_post, contenido, fecha_publicacion) values (?,?,?,?)",
      [fk_usuario, fk_post, contenido, new Date()],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

const deleteComment = ({ id, fk_usuario, fk_post }) => {
  console.log("Paso por delete");
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM tbi_comentarios WHERE id=? AND fk_usuario=? AND fk_post=?",
      [id, fk_usuario, fk_post],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

//Crear un post
// [X] Necesita fk_ancestro
// [ ] Necesita validadores de longitud

const create = ({
  titulo,
  contenido,
  imagen,
  publico,
  colaborable,
  latitud,
  longitud,
  fk_id_anterior,
  fk_usuario,
  fk_ancestro
}) => {
  return new Promise((resolve, reject) => {
    //Partimos de poner el número de autores en null como si todos los posts fueran intermedios
    let numero_autores = null;
    //Como todavía no sabemos como vamos a recibir los datos del front, comprobamos las cuatro posibilidades del valor fk_id_anterior. Además nos aseguramos que aunque no lleguen bien los datos,éstos se acomoden siempre al modelo de la tabla.
    if (
      fk_id_anterior == 0 ||
      fk_id_anterior === 0 ||
      fk_id_anterior === null ||
      fk_id_anterior === undefined
    ) {
      //si se cumple lo anterior, es decir, es un post inicial, le damos el primer valor a numero_autores y aseguramos que fk_id_anterior sea null. Puede que más adelante la segunda sentencia no sea necesaria
      numero_autores = 1;
      fk_id_anterior = null;
      fk_ancestro = null;
    }

    //Para los valores latitud, longitud e imagen hay que hacer algo parecido, para que en SQL se graben como null y no como 0. Los pongo en ternario, que lo permiten y es más cómodo:

    imagen = imagen === "" || imagen === undefined ? null : imagen;
    latitud = latitud == 0 || latitud == undefined ? null : latitud;
    longitud = longitud == 0 || longitud == undefined ? null : longitud;

    db.query(
      "INSERT INTO posts (titulo, contenido, imagen, numero_autores, publico, colaborable, latitud, longitud, fecha_publicacion, fk_id_anterior, fk_usuario,fk_ancestro) values (?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        titulo,
        contenido,
        imagen,
        numero_autores,
        publico,
        colaborable,
        latitud,
        longitud,
        new Date(),
        fk_id_anterior,
        fk_usuario,
        fk_ancestro
      ],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

const putAncestro = id => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE posts SET fk_ancestro=? WHERE id=?",
      [id, id],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

const getByLocation = (latitud, longitud, distance = 5, fk_id_anterior) => {
  return new Promise((resolve, reject) => {
    latitud = parseInt(latitud);
    longitud = parseInt(longitud);
      let pos0 = geoutils.moveTo({ latitud: latitud, longitud: longitud }, { heading: 0, distance: distance })
      let pos90 = geoutils.moveTo({ latitud: latitud, longitud: longitud }, { heading: 90, distance: distance })
      let pos180 = geoutils.moveTo({ latitud: latitud, longitud: longitud }, { heading: 180, distance: distance })
      let pos270 = geoutils.moveTo({ latitud: latitud, longitud: longitud }, { heading: 270, distance: distance })
      console.log('hola')
      connect((pool) => {
          pool.query('select * from cauken.posts where latitud < ? and latitud > ? and longitud > ? and longitud < ? AND fk_id_anterior = ? ;', [pos0.latitud, pos180.latitud, pos270.longitud, pos90.longitud, fk_id_anterior],
              (err, rows) => {
                  if (err) reject(err);
                  resolve(rows);
              });
      });
  });
};

module.exports = {
  getAll: getAll,
  getById: getById,
  getCovers: getCovers,
  countChildren: countChildren,
  findChildren: findChildren,
  getFather: getFather,
  getLikes: getLikes,
  updateLikes: updateLikes,
  searchLike: searchLike,
  insertLike: insertLike,
  updateLike: updateLike,
  getComments: getComments,
  createComment: createComment,
  deleteComment: deleteComment,
  create: create,
  putAncestro: putAncestro,
  getByLocation: getByLocation
};
