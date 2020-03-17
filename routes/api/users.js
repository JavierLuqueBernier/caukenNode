const router = require('express').Router();
const bcrypt = require('bcryptjs'); //para encriptar
const moment = require('moment'); //libreria de manejo de fechas
const jwt = require('jwt-simple'); //libreria para crear tokens
const { check, validationResult} = require('express-validator'); // nos permite validar campos de formularios

const User = require('../../models/user');

// GET http://localhost:3000/api/users/

router.get('/', async (req, res) => {
    const rows = await user.getAll();
    res.json(rows);
});

// POST http://localhost:3000/api/register/

router.post('/register', [
        check('email', 'El email bien puesto').isEmail(),

        check('nombre', 'El nombre de usuario debe estar entre 3 y 15 caracteres').isLength({ min: 3 , max: 30 }).isAlphanumeric(), //alphanumeric es para que solo se pueda utilizar letras, no numeros
        
        check('password', 'La password con digitos').custom(() => {
            return (/^(?=.*\d).{4,8}$/).test(value);
        })
    ], async (req, res) => {

    const errors = validationResult(req); // esta linea nos informa de si ha habido fallos en alguno de los middleware de arriba
    if(!errors.isEmpty()) {
        res.status(422).json(errors.array());
    }

    const passwordEnc = bcrypt.hashSync( req.body.password, 10); // con ese 10 lo que estamos pidiendo es que la contraseña pase por el algoritmo 10 veces para que sea más dificil de desencriptar
    req.body.password = passwordEnc;
    const result = await User.create(req.body);
    res.json(result);
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.emailExists(req.body.email);
        if (!user) {
            return res.status(401).json({ error: 'Error en email y/o password' });
        }
        console.log(req.body.password, user.password)
        const iguales = bcrypt.compareSync(req.body.password, user.password);
        if(iguales) {
            res.json({ success: createToken(user) })
        } else {
            res.status(401).json({ error: 'Error en email y/o password' });
        }
    } catch (err) {
        console.log(err);
    }
    
})

const createToken = (pUser) => {
    const payload = {
        usuarioId: pUser.id,
        fechaCreacion: moment().unix(), //unix es para trabajar con segundos
        fechaExpiracion: moment().add(15, 'minutes').unix()
    }

    return jwt.encode(payload, process.env.SECRET_KEY)
}


module.exports = router;
