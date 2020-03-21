const jwt = require("jwt-simple");
const moment = require("moment");
const fs = require("fs");


const checkToken = (req, res, next) => {
  // 1 - Comprobar si existe la cabecera user-token
  if (!req.body["usertoken"]) {
    return res.json({ error: "Debes incluir la cabecera usertoken" });
  }
  //2 - Comprobar si token es correcto
  const token = req.body["usertoken"];
  let payload = null;
  try {
    payload = jwt.decode(token, process.env.SECRET_KEY);
  } catch (err) {
    return res.json({ error: "El token no es válido" });
  }

  //3 - Mirar si el token ha expirado
  const fechaActual = moment().unix();
  if (fechaActual > payload.fechaExpiracion) {
    return res.json({ error: "El token no es válido" });
  }
  req.payload = payload;
  next();
};

//Guarda las acciones de los usuarios
const registerAction = (req,res,next)=>{
  fs.appendFileSync('userActions.log',`Usuario:${req.payload.usuarioId}. Método: ${req.method}. Url: ${req.url}.`)
  next();
};

module.exports = {
  checkToken: checkToken,
  registerAction
};
