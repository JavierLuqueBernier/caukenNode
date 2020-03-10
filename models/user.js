const getAll = () => {
    return new Promise((resolve, reject) => {
        db.query('select * from usuarios', (err, rows) => {
            if (err) reject(err)
            resolve(rows);
        });
    });
};

const emailExists = (pEmail) => {
    return new Promise((resolve, reject) => {
        db.query('select * from usuarios where email = ?', [pEmail], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(null);
            resolve(rows[0]);
        })
    });
}

/* const getById = (pAlumnoId) => {
    return new Promise((resolve, reject) => {
        db.query('select * from alumnos where id = ?', [pAlumnoId], (err, rows) => {
            if(err) reject(err);
            if(rows.lenght === 0) {
                resolve(null);
            }
            resolve(rows[0]);
        })
    });
}; */

const create = ({nombre, contraseña, email, activo, premium, reputacion}) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO usuarios (nombre, contraseña, email, activo, premium, fecha_alta, reputacion) values (?,?,?,?,?,?,?)',
         [nombre, contraseña, email, activo, premium, new Date(), reputacion], 
         (err, result) => {
             if (err) reject(err);
             resolve(result);
         })
    });
}

module.exports = { //si no exporto la funcion no la puedo utilizar fuera
    getAll: getAll,
    create: create,
    emailExists: emailExists
}