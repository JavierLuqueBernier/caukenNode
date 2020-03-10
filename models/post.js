const getAll = () => {
    return new Promise((resolve, reject) => {
        db.query('select * from posts', (err, rows) => {
            if (err) reject(err)
            resolve(rows);
        });
    });
};

const getById = (pPostId) => {
    return new Promise((resolve, reject) => {
        db.query('select * from posts where id = ?', [pPostId], (err, rows) => {
            if(err) reject(err);
            if(rows.lenght === 0) {
                resolve(null);
            }
            resolve(rows[0]);
        })
    });
};

const create = ({titulo, contenido, imagen, publico, colaborable, latitud, longitud, fk_id_anterior, fk_usuario}) => {
    return new Promise((resolve, reject) => {
        let numero_autores=null;
        if(fk_id_anterior===null){
            numero_autores=1;
        }
        db.query('INSERT INTO posts (titulo, contenido, imagen, numero_autores, publico, colaborable, latitud, longitud, fecha_publicacion, fk_id_anterior, fk_usuario) values (?,?,?,?,?,?,?,?,?,?,?)',
         [titulo, contenido, imagen, numero_autores, publico, colaborable, latitud, longitud, new Date(), fk_id_anterior, fk_usuario],
         (err, result) => {
             if (err) reject(err);
             resolve(result);
         })
    });
}

module.exports = {
    getAll: getAll,
    getById: getById,
    create: create
}