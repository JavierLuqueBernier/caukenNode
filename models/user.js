const getAll = () => {
    return new Promise((resolve, reject) => {
        db.query('select * from posts', (err, rows) => {
            if (err) reject(err)
            resolve(rows);
        });
    });
};

/* const emailExists = (pEmail) => {
    return new Promise((resolve, reject) => {
        db.query('select * from usuarios where email = ?', [pEmail], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(null);
            resolve(rows[0]);
        })
    });
} */

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

/* const create = ({nombre, apellidos, edad, email, matricula}) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO alumnos (nombre, apellidos, email, edad, fecha_matricula, matricula) values (?,?,?,?,?,?)',
         [nombre, apellidos, email, edad, new Date(), matricula], 
         (err, result) => {
             if (err) reject(err);
             resolve(result);
         })
    });
} */

/* const deleteById = (pAlumnoId) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM alumnos WHERE id = ?', [pAlumnoId], (err, result) => {
            if (err) reject(err);
            resolve(result); 
        })
    })
} */

module.exports = { //si no exporto la funcion no la puedo utilizar fuera
    getAll: getAll
    //create: create,
    //emailExists: emailExists
}