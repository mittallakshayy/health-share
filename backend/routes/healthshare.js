var express = require('express');
var router = express.Router();
const db = require('../db');
/* GET all healthshare data. */
router.get('/', async (req, res, next) => {
    try {
      const result = await db.query('SELECT * FROM healthshare');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  

module.exports = router;
