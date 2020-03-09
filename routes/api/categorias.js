const router = require('express').Router();


const categoria = require('../../models/categoria');

// GET http://localhost:3000/api/categorias/

router.get('/', async (req, res) => {
  const rows = await categoria.getAll();
  res.json(rows);
});

module.exports = router;
