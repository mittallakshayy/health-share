var express = require("express");
var router = express.Router();
const db = require("../db");
/* GET all healthshare data. */
router.get("/alldata", async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM rawdata ORDER BY id ASC LIMIT 50 ");
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/querydata", async (req, res, next) => {
  try {
    const queryString=req.query.query;
    const result = await db.query('SELECT * FROM rawdata WHERE text LIKE $1', ['%' + queryString + '%']);
    console.log(queryString);
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/sortbysource", async (req, res, next) => {
  try {
    const source=req.query.source;
    const result = await db.query('SELECT * FROM rawdata WHERE data_source = $1 LIMIT 20', [source]);
    console.log(source);
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/twitter-visualization", async (req, res, next) => {
  try {
    const source=req.query.source;
    const result = await db.query(`SELECT TO_CHAR("created_at", 'YYYY-MM-DD') AS date, COUNT(id) AS count
    FROM rawdata
    GROUP BY TO_CHAR("created_at", 'YYYY-MM-DD')
    ORDER BY date ASC;`);
    console.log(source);
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = router;