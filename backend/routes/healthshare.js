var express = require("express");
var router = express.Router();
const db = require("../db");
/* GET all healthshare data. */
router.get("/api/alldata", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT * FROM rawdata ORDER BY id ASC LIMIT 100"
    );
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/api/querydata", async (req, res, next) => {
  try {
    const queryString = req.query.query;
    const result = await db.query("SELECT * FROM rawdata WHERE text LIKE $1", [
      "%" + queryString + "%",
    ]);
    console.log(queryString);
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/articledata", async (req, res, next) => {
  try {
    const id = req.query.id;
    const result = await db.query("SELECT * FROM rawdata WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.status(200).json(result.rows[0]);
    console.log(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/sortbysource", async (req, res, next) => {
  try {
    const source = req.query.source;
    const result = await db.query(
      "SELECT * FROM rawdata WHERE data_source = $1 LIMIT 400",
      [source]
    );
    console.log(source);
    res.status(200);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/twitter-visualization", async (req, res, next) => {
  try {
    const source = req.query.source;
    const result =
      await db.query(`SELECT TO_CHAR("created_at", 'YYYY-MM-DD') AS date, COUNT(id) AS count
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
