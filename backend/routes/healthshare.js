var express = require("express");
var router = express.Router();
const db = require("../db");

/* GET all healthshare data. */
router.get("/api/alldata", async (req, res, next) => {
  try {
    const limit = 50;
    const page = parseInt(req.query.page) || 1; // Get the page number from query params, default to 1
    const offset = (page - 1) * limit;

    const result = await db.query(
      "SELECT * FROM rawdata ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    const totalCountResult = await db.query("SELECT COUNT(*) FROM rawdata");
    const totalRecords = totalCountResult.rows[0].count;
    res.status(200).json({
      data: result.rows,
      totalRecords: parseInt(totalRecords), // Convert to number if necessary
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/api/sortbysource", async (req, res, next) => {
  try {
    const limit = 50;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page param
    const offset = (page - 1) * limit;
    const sources = req.query.source; // Get the source parameter
    if (!sources) {
      return res.status(400).json({ error: "Source parameter is required." }); // Change this to return JSON
  }
  
    const sourceArray = sources.split(',').filter(Boolean);
    
    if (sourceArray.length === 0) {
      return res.status(400).send("At least one valid source must be provided.");
    }
    const sourcePlaceholders = sourceArray.map((_, index) => `$${index + 1}`).join(', ');
    const dataQuery = `SELECT * FROM rawdata WHERE data_source IN (${sourcePlaceholders}) ORDER BY id ASC LIMIT $${sourceArray.length + 1} OFFSET $${sourceArray.length + 2}`;
    
    // Counting total records
    const countQuery = `SELECT COUNT(*) FROM rawdata WHERE data_source IN (${sourcePlaceholders})`;

    const params = [...sourceArray, limit, offset];
    const result = await db.query(dataQuery, params);
    const totalCountResult = await db.query(countQuery, sourceArray);

    const totalRecords = parseInt(totalCountResult.rows[0].count); // Parse to an integer
    res.status(200).json({
      data: result.rows,
      totalRecords: totalRecords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//downloads results (either All or of a particular source)
router.get("/api/allresults", async (req, res, next) => {
  try {
    const source = req.query.source; // Get the source from query parameters
    let result;
    // Check for "All" as the source
    if (source && source !== "All") {
      result = await db.query("SELECT * FROM rawdata WHERE data_source = $1 ORDER BY id ASC",[source]);
    } else {
      result= await db.query("SELECT * FROM rawdata ORDER BY id ASC");
    }
    res.status(200).json({
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
    // Return a JSON response on error
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/api/querydata", async (req, res, next) => {
  try {
    
    const queryString = req.query.query;
    const limit = 50;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const sources = req.query.source ? req.query.source.split(",") : [];

    // Construct SQL query based on presence of sources
    let query = `SELECT * FROM rawdata WHERE text ILIKE $1`;
    const params = ["%" + queryString + "%"];

    if (sources.length > 0) {
      const sourcePlaceholders = sources.map((_, index) => `$${index + 2}`).join(", ");
      query += ` AND data_source IN (${sourcePlaceholders})`;
      params.push(...sources);
    }

    query += ` ORDER BY id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Count query for pagination
    let countQuery = `SELECT COUNT(*) FROM rawdata WHERE text ILIKE $1`;
    const countParams = ["%" + queryString + "%"];
    if (sources.length > 0) {
      const sourcePlaceholders = sources.map((_, index) => `$${index + 2}`).join(", ");
      countQuery += ` AND data_source IN (${sourcePlaceholders})`;
      countParams.push(...sources);
    }

    const totalCountResult = await db.query(countQuery, countParams);
    const totalRecords = parseInt(totalCountResult.rows[0].count);

    res.status(200).json({
      data: result.rows,
      totalRecords: totalRecords,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/api/querydata/all", async (req, res, next) => {
  try {
    const queryString = req.query.query; // Get the search query
    const sources = req.query.source ? req.query.source.split(",") : [];

    // Construct SQL query based on the presence of queryString and sources
    let query = `SELECT * FROM rawdata WHERE text ILIKE $1`;
    const params = [`%${queryString}%`]; // Initialize params with the query string

    if (sources.length > 0) {
      const sourcePlaceholders = sources.map((_, index) => `$${index + 2}`).join(", ");
      query += ` AND data_source IN (${sourcePlaceholders})`;
      params.push(...sources); // Add the sources to params
    }

    const result = await db.query(query, params);

    res.status(200).json({
      data: result.rows,
      totalRecords: result.rowCount, // Total records returned
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/api/advancedquerydata", async (req, res, next) => {
  try {
    const { 
      query, 
      sourceType = "all", 
      dateFrom, 
      dateTo 
    } = req.query;

    // Start building the base query
    let queryParts = [];
    let queryValues = [];

    // Base query
    let sqlQuery = "SELECT * FROM rawdata WHERE 1=1"; 

    // Filter by keywords (text)
    if (query && query.trim()) { // Check if query is provided
      sqlQuery += " AND text ILIKE $" + (queryValues.length + 1);
      queryValues.push(`%${query}%`);
    }

    // Filter by source type
    if (sourceType && sourceType !== "all") { // "all" indicates no specific filter
      sqlQuery += " AND data_source = $" + (queryValues.length + 1);
      queryValues.push(sourceType);
    }

    // Filter by date range, only if both dates are provided
    if (dateFrom && dateFrom.trim()) { // Ensure dateFrom is provided
      sqlQuery += " AND created_at >= $" + (queryValues.length + 1);
      queryValues.push(dateFrom);
    }
    if (dateTo && dateTo.trim()) { // Ensure dateTo is provided
      sqlQuery += " AND created_at <= $" + (queryValues.length + 1);
      queryValues.push(dateTo);
    }

    // Execute the final query
    const result = await db.query(sqlQuery, queryValues);
    
    res.status(200).json(result.rows);
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
