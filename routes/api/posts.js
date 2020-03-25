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
    const rows = await Post.getCovers(req.body);
    if (rows["length"] > 0) {
      res.json(rows);
    } else {
      res.json({ error: "Covers de usuario no encontrado" });
    }
  } catch (err) {
    res.json(err);
  }
});

// POST http://localhost:3000/api/posts/children
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
    const result = await Post.findChildren(req.body);
    if (result["length"] > 0) {
      res.json(result);
    } else {
      res.json({ warning: "Este post no tiene continuación" });
    }
  } catch (err) {
    res.json(err);
  }
});

router.post("/ancestors", async (req, res) => {
  let arr = new Array();
  let id = req.body.id;
  let limit = parseInt(req.body.limit);
  console.log(limit);
  try {
    let i = 0;
    do {
      const rows = await Post.getFather(id);
      arr.push(rows[0]);
      id = rows[0].fk_id_anterior;
      if (limit != undefined || limit != null) {
        i++;
        console.log(i);
        
      }
    } while (id != null && i < limit);
    res.json(arr);
  } catch (err) {
    res.json(err);
  }
});

// POST http://localhost:3000/api/posts/likes
router.post("/likes", async (req, res) => {
  try {
    const result = await Post.getLikes(req.body.id);
    if (result.length === 1) {
      res.json(result);
    } else {
      res.json({ errors: "Post no encontrado" });
    }
  } catch (err) {
    res.json(err);
  }
});

// POST http://localhost:3000/api/posts/comments
router.post("/comments", async (req, res) => {
  try {
    const result = await Post.getComments(req.body);
    if (result.length >= 1) {
      res.json(result);
    } else {
      res.json({ warning: "Post sin comentarios" });
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
  const result = await Post.create(req.body);
  if (result["affectedRows"] === 1) {
    //si es un post inicial se actualiza su fk_ancestro a su propia id, la idea es que en el resto de casos la fk_ancestro sea igual a la de su padre y no tener que recorrer todo el árbol hasta el origen cada vez que se necesite.
    if (req.body.fk_ancestro === null) {
      await Post.putAncestro(result["insertId"]);
    }
    const post = await Post.getById(result["insertId"]);
    res.json(post);
  } else {
    res.json({ error: "El post no se ha insertado" });
  }
});

// PUT http://localhost:3000/api/posts/checklikes
//Chequea si un usuario tiene likes en un post
router.post("/checklike", async (req, res) => {
  try {
    const searchLike = await Post.searchLike(req.body);
    console.log(searchLike);
    if (searchLike.length === 0) {
      res.json({ activo: false });
    } else if (searchLike[0].activo === "inactivo") {
      res.json({ activo: false });
    } else if (searchLike[0].activo === "activo") {
      res.json({ activo: true });
    }
  } catch (err) {
    res.json(err);
  }
});

// PUT http://localhost:3000/api/posts/likes
// Proceso que añade un like a un post. Si la relación ya existía la actualiza a like activo o inactivo
router.put("/likes", async (req, res) => {
  try {
    const searchLike = await Post.searchLike(req.body);
    if (searchLike.length === 0) {
      await Post.insertLike(req.body);
      const updateLikes = await Post.updateLikes(req.body, {
        activo: "activo"
      });
      res.json(updateLikes);
    } else if (searchLike[0].activo === "activo") {
      await Post.updateLike({ id: searchLike[0].id, activo: "inactivo" });
      const updateLikes = await Post.updateLikes(req.body, {
        activo: "inactivo"
      });
      res.json(updateLikes);
    } else if (searchLike[0].activo === "inactivo") {
      await Post.updateLike({ id: searchLike[0].id, activo: "activo" });
      const updateLikes = await Post.updateLikes(req.body, {
        activo: "activo"
      });
      res.json(updateLikes);
    }
  } catch (err) {
    res.json(err);
  }
});

// POST http://localhost:3000/api/posts/comments/create
router.post("/comments/create", async (req, res) => {
  try {
    const result = await Post.createComment(req.body);
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

// POST http://localhost:3000/api/posts/comments/create
router.delete("/comments/delete", async (req, res) => {
  console.log("paso por api delete");
  console.log(req.body);
  try {
    const result = await Post.deleteComment(req.body);
    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
