const router = require('express').Router();


const post = require('../../models/post');

// GET http://localhost:3000/api/posts/

router.get('/', async (req, res) => {
  const rows = await post.getAll();
  res.json(rows);
});

module.exports = router;
