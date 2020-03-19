const router = require("express").Router();
const Post = require("../../models/post");
const middlewares = require("../middlewares");

// GET http://localhost:3000/api/posts/

router.get("/", async (req, res) => {
  const rows = await Post.getAll();
  res.json(rows);
});

// GET http://localhost:3000/api/posts/covers
// Devuelve un array con todas las covers
router.get("/covers", async (req, res) => {
  const rows = await Post.getCovers();
  res.json(rows);
});

// GET http://localhost:3000/api/posts/:id

router.get("/:postId", async (req, res) => {
  const post = await Post.getById(req.params.postId); //en esta linea hay algo mal pero no se
  res.json(post);
});


// POST http://localhost:3000/api/covers
// Devuelve un array con varias covers, se pasa opcionalmente por el body:
//{limit:number,offset:number,likes:number,usuario:id} donde limit es la cantidad de covers y offset desde donde empieza. Si no hay filtro de likes da el valor 0 automáticamente. Si no hay autor se devuelven las covers de todos los autores.
router.post("/covers", async (req, res) => {
  try {
    console.log(req.body);
    const rows = await Post.getCovers(req.body);
    console.log(rows["length"]);
    if (rows["length"] > 0) {
      res.json(rows);
    } else {
      res.json({ error: "Covers de usuario no encontrado" });
    }
  } catch (err) {
    res.json(err);
  }
});

// POST http://localhost:3000/api/children
// Devuelve un array con los datos de los posts hijo
router.post("/children", async (req, res) => {
  try {
    // Se cuenta el número de hijos totales y si <=3 se ignoran el resto de parámetros
    const countChildren = await Post.countChildren(req.body.id);
    children = countChildren[0]["COUNT(*)"];
    if (children <= 3) {
      req.body.limit = null;
      req.body.offset = null;
      req.body.likes = null;
      req.body.usuario = null;
    }
    const results = await Post.findChildren(req.body);
    console.log(results["length"]);
    if (results["length"] > 0) {
      res.json(results);
    } else {
      res.json({ warning: "Este post no tiene continuación" });
    }
  } catch (err) {
    res.json(err);
  }
});

/* **************************************************************************
/                   ¡¡¡ACCIONES QUE REQUIEREN LOGIN!!!!                     /
****************************************************************************/
router.use(middlewares.checkToken);
router.use(middlewares.registerAction);

// POST http://localhost:3000/api/posts
router.post("/create", async (req, res) => {
  console.log('EXISTO')
  const result = await Post.create(req.body);
  if (result["affectedRows"] === 1) {
    console.log( typeof req.body.fk_ancestro)
    //si es un post inicial se actualiza su fk_ancestro a su propia id, la idea es que en el resto de casos la fk_ancestro sea igual a la de su padre y no tener que recorrer todo el árbol hasta el origen cada vez que se necesite.
    if(req.body.fk_ancestro===null){
      await Post.putAncestro(result["insertId"]);
    }
    const post = await Post.getById(result["insertId"]);
    res.json(post);
  } else {
    res.json({ error: "El post no se ha insertado" });
  }
});

module.exports = router;
