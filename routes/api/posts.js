const router = require('express').Router();
const Post = require('../../models/post');

// GET http://localhost:3000/api/posts/

router.get("/", async (req, res) => {
  const rows = await Post.getAll();
  res.json(rows);
});

// GET http://localhost:3000/api/posts/id

router.get('/:postId', async (req, res) => {
  const post = await Post.getById(req.params.postId); //en esta linea hay algo mal pero no se
  res.json(post);
})

// POST http://localhost:3000/api/posts
router.post('/', async (req, res) => {
  const result = await Post.create(req.body);
  if(result['affectedRows'] === 1) {
      const post = await Post.getById(result['insertId']);
      res.json(post);
  } else {
      res.json({ error: "El post no se ha insertado" });
  }    
});

module.exports = router;
