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

// Busca los datos básicos de las covers en función de parámetros opcionales
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
      `SELECT id,titulo,imagen,likes,fk_usuario,fecha_publicacion FROM posts WHERE fk_id_anterior IS NULL AND LIKES >=? ${usuario} LIMIT ? OFFSET ?`,
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
      (err, results) => {
        if (err) reject(err);
        resolve(results);
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
      `SELECT id,titulo,imagen,likes,fk_usuario,fecha_publicacion FROM posts WHERE fk_id_anterior = ? AND LIKES >=? ${usuario} LIMIT ? OFFSET ?`,
      [parseInt(id), parseInt(likes), parseInt(limit), parseInt(offset)],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
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
        fk_ancestro,
      ],
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
};

const putAncestro = ( id ) => {
  return new Promise((resolve,reject)=>{
db.query(
    "UPDATE posts SET fk_ancestro=? WHERE id=?",
    [id, id],
    (err, result) => {
      if (err) reject(err);
      resolve(result);
    }
  )}
  )}
    
    
  

module.exports = {
  getAll: getAll,
  getById: getById,
  getCovers: getCovers,
  countChildren: countChildren,
  findChildren: findChildren,
  create: create,
  putAncestro: putAncestro
};
