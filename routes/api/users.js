const router = require('express').Router();
const bcrypt = require('bcryptjs'); //para encriptar
const moment = require('moment'); //libreria de manejo de fechas
const jwt = require('jwt-simple'); //libreria para crear tokens
const { check, validationResult } = require('express-validator'); // nos permite validar campos de formularios

const User = require('../../models/user');

// GET http://localhost:3000/api/users/

router.get('/', async (req, res) => {
    const rows = await user.getAll();
    res.json(rows);
});

// POST http://localhost:3000/api/register/

router.post('/register', [
    check('email', 'El email bien puesto').isEmail(),

    check('nombre', 'El nombre de usuario debe estar entre 3 y 15 caracteres').isLength({ min: 3, max: 30 }).isAlphanumeric(), //alphanumeric es para que solo se pueda utilizar letras y numeros, no signos

    check('password', 'La password debe contener letras y digitos').custom((value) => {
        return (/^([a-zA-Z0-9@*#]{8,15})$/).test(value);
    }),

    check('biografia', 'La biografia no puede tener más de 255 caracteres').isLength({ max: 255 }).isAlphanumeric(),

], async (req, res) => {

    const errors = validationResult(req); // esta linea nos informa de si ha habido fallos en alguno de los middleware de arriba
    if (!errors.isEmpty()) {
        res.status(422).json(errors.array());
    }

    const emailOrUserExists = await User.emailOrUserExists(req.body.email, req.body.nombre);
    if (emailOrUserExists) {
        return res.json({ emailOrUserExists: 'Este email y/o nombre ya está en uso, por favor, utilice otro' })
    }


    const passwordEnc = bcrypt.hashSync(req.body.password, 10); // con ese 10 lo que estamos pidiendo es que la contraseña pase por el algoritmo 10 veces para que sea más dificil de desencriptar
    req.body.password = passwordEnc;
    const result = await User.create(req.body);
    res.json(result);
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.userExists(req.body.nombre);
        if (!user) {
            return res.status(401).json({ error: 'Error en nombre1' });
        }
        console.log(req.body.password, user.password)
        const iguales = bcrypt.compareSync(req.body.password, user.password);
        console.log(iguales)
        if (iguales) {
            res.json({ success: createToken(user), userid: user.id })
        } else {
            res.status(401).json({ error: 'Error en nombre2' });
        }
    } catch (err) {
        console.log(err);
    }

})

router.post('/checktoken', async (req, res) => {

    if (!req.body["usertoken"] || !req.body["userid"]) {
        return res.json({ login: false });
    }
    //2 - Comprobar si token es correcto
    const token = req.body["usertoken"];
    let payload = null;
    try {
        payload = jwt.decode(token, process.env.SECRET_KEY);
        const fechaActual = moment().unix();
        if (fechaActual > payload.fechaExpiracion || payload.userid != req.body.userid) {
            return res.json({ login: false });
        }
        console.log("token correcto");
        console.log(payload);
        res.json({ login: true })
    } catch (err) {
        return res.json({ login: false });
    }
})

const createToken = (pUser) => {
    const payload = {
        userid: pUser.id,
        fechaCreacion: moment().unix(), //unix es para trabajar con segundos
        /* fechaExpiracion: moment().add(43200, 'minutes').unix() //esto es igual a un mes */
        fechaExpiracion: moment().add(30, 'minutes').unix() //esto es igual a un mes
    }

    return jwt.encode(payload, process.env.SECRET_KEY)
}


module.exports = router;
