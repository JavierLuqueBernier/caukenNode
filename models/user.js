const getAll = () => {
    return new Promise((resolve, reject) => {
        db.query('select * from usuarios', (err, rows) => {
            if (err) reject(err)
            resolve(rows);
        });
    });
};

const getById = pUserId => {
    return new Promise((resolve, reject) => {
      db.query("select * from users where id = ?", [pUserId], (err, rows) => {
        if (err) reject(err);
        if (rows.lenght === 0) {
          resolve(null);
        }
        resolve(rows[0]);
      });
    });
  };

const emailOrUserExists = (pEmail, pUser) => {
    return new Promise((resolve, reject) => {
        db.query('select * from usuarios where email = ? or nombre = ?' , [pEmail, pUser], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(null);
            resolve(rows[0]);
        })
    });
}

const userExists = (pUser) => {
    return new Promise((resolve, reject) => {
        db.query('select * from usuarios where nombre = ?', [pUser], (err, rows) => {
            if (err) return reject(err);
            if (rows.length === 0) return resolve(null);
            resolve(rows[0]);
        })
    });
}

const create = ({nombre, password, email}) => {
    return new Promise((resolve, reject) => { 
        const activo = 'activo';
        const premium = 'free';
        const reputacion = 10;
        db.query('INSERT INTO usuarios (nombre, password, email, activo, premium, fecha_alta, reputacion) values (?,?,?,?,?,?,?)',
         [nombre, password, email, activo, premium, new Date(), reputacion], 
         (err, result) => {
             if (err) reject(err);
             resolve(result);
         })
    });
}

module.exports = { //si no exporto la funcion no la puedo utilizar fuera
    getAll: getAll,
    getById: getById,
    create: create,
    emailOrUserExists: emailOrUserExists,
    userExists: userExists
}