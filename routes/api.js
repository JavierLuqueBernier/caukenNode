const router = require('express').Router();

const apiUsersRouter= require('./api/users');
const apiCategoriasRouter=require('./api/categorias');
const apiPostsRouter=require('./api/posts');

router.use('/users', apiUsersRouter)
router.use('/categoria', apiCategoriasRouter)
router.use('/posts', apiPostsRouter)

module.exports = router;