const router = require('express').Router();


const user = require('../../models/user');

// GET http://localhost:3000/api/users/

router.get('/', async (req, res) => {
    const rows = await user.getAll();
    res.json(rows);
});

module.exports = router;
