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

// Endpoint for emotion data visualization
router.get("/api/emotion-visualization", async (req, res, next) => {
  try {
    const { sources, startDate, endDate, sentiment, emotions } = req.query;
    
    let sqlQuery = "SELECT * FROM rawdata_with_emotion WHERE 1=1";
    const queryParams = [];
    let paramCounter = 1;

    // Add sources filter if provided
    if (sources && sources.length > 0) {
      const sourceArray = sources.split(',');
      const sourcePlaceholders = sourceArray.map(() => `$${paramCounter++}`).join(', ');
      sqlQuery += ` AND data_source IN (${sourcePlaceholders})`;
      queryParams.push(...sourceArray);
    }

    // Add date range filter if provided
    if (startDate) {
      sqlQuery += ` AND created_at >= $${paramCounter++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      sqlQuery += ` AND created_at <= $${paramCounter++}`;
      queryParams.push(endDate);
    }

    // Add emotion filters if provided
    if (emotions && emotions.length > 0) {
      const emotionArray = emotions.split(',');
      const emotionConditions = [];
      
      emotionArray.forEach(emotion => {
        if (emotion !== 'All') {
          emotionConditions.push(`${emotion.toLowerCase()} > 0.5`);
        }
      });
      
      if (emotionConditions.length > 0) {
        sqlQuery += ` AND (${emotionConditions.join(' OR ')})`;
      }
    }

    // Execute query
    const result = await db.query(sqlQuery, queryParams);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint specifically for wordcloud data
router.get("/api/wordcloud-data", async (req, res, next) => {
  try {
    const { sources, startDate, endDate, emotions } = req.query;
    
    // First, count total records matching the filter
    let countQuery = `SELECT COUNT(*) FROM rawdata_with_emotion WHERE 1=1`;
    const countParams = [];
    let paramCounter = 1;
    
    // Add sources filter if provided
    if (sources && sources.length > 0) {
      const sourceArray = sources.split(',').filter(Boolean);
      if (sourceArray.length > 0) {
        const sourcePlaceholders = sourceArray.map(() => `$${paramCounter++}`).join(', ');
        countQuery += ` AND data_source IN (${sourcePlaceholders})`;
        countParams.push(...sourceArray);
      }
    }

    // Add date range filter if provided
    if (startDate) {
      countQuery += ` AND created_at >= $${paramCounter++}`;
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ` AND created_at <= $${paramCounter++}`;
      countParams.push(endDate);
    }
    
    // Execute count query
    const totalCountResult = await db.query(countQuery, countParams);
    const totalRecords = parseInt(totalCountResult.rows[0].count);
    
    // Main query for word data
    let sqlQuery = `
      WITH words AS (
        SELECT 
          unnest(string_to_array(lower(regexp_replace(text, '[^a-zA-Z0-9\\s]', '', 'g')), ' ')) AS word,
          dominant_emotion,
          anger, anticipation, disgust, fear, joy, sadness, surprise, trust
        FROM rawdata_with_emotion
        WHERE 1=1
    `;
    
    const queryParams = [];
    paramCounter = 1;

    // Add sources filter if provided
    if (sources && sources.length > 0) {
      const sourceArray = sources.split(',').filter(Boolean);
      if (sourceArray.length > 0) {
        const sourcePlaceholders = sourceArray.map(() => `$${paramCounter++}`).join(', ');
        sqlQuery += ` AND data_source IN (${sourcePlaceholders})`;
        queryParams.push(...sourceArray);
      }
    }

    // Add date range filter if provided
    if (startDate) {
      sqlQuery += ` AND created_at >= $${paramCounter++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      sqlQuery += ` AND created_at <= $${paramCounter++}`;
      queryParams.push(endDate);
    }

    // Add emotion filters if provided - fixed to handle empty strings and 'All' properly
    if (emotions && emotions.length > 0) {
      const emotionArray = emotions.split(',').filter(emotion => 
        emotion && emotion.trim() !== '' && emotion.trim() !== 'All'
      );
      
      if (emotionArray.length > 0) {
        const emotionConditions = emotionArray.map(emotion => {
          // Create a condition where this emotion has significant presence
          return `${emotion.toLowerCase()} > 0.5`;
        });
        
        if (emotionConditions.length > 0) {
          sqlQuery += ` AND (${emotionConditions.join(' OR ')})`;
        }
      }
    }

    // Complete the query with word frequency calculation and filter out common stop words
    sqlQuery += `
      )
      SELECT 
        word,
        COUNT(*) as frequency,
        MODE() WITHIN GROUP (ORDER BY dominant_emotion) as dominant_emotion,
        AVG(anger) as avg_anger,
        AVG(anticipation) as avg_anticipation,
        AVG(disgust) as avg_disgust,
        AVG(fear) as avg_fear,
        AVG(joy) as avg_joy,
        AVG(sadness) as avg_sadness,
        AVG(surprise) as avg_surprise,
        AVG(trust) as avg_trust
      FROM words
      WHERE length(word) > 3
      AND word NOT IN ('this', 'that', 'there', 'then', 'they', 'their', 'these', 'those', 'with', 'from', 'have', 'what', 'when', 'where', 'which', 'will', 'would', 'could', 'should', 'about')
      GROUP BY word
      ORDER BY frequency DESC
      LIMIT 100
    `;

    // Execute query
    const result = await db.query(sqlQuery, queryParams);
    
    // Add total records to response
    res.status(200).json({
      words: result.rows,
      totalRecords: totalRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint specifically for emotion pie chart data
router.get("/api/emotion-distribution", async (req, res, next) => {
  try {
    const { sources, startDate, endDate, emotions } = req.query;
    
    // Build WHERE clause and params
    let whereClause = "1=1";
    const queryParams = [];
    let paramCounter = 1;
    
    // Add sources filter if provided
    if (sources && sources.length > 0) {
      const sourceArray = sources.split(',').filter(Boolean);
      if (sourceArray.length > 0) {
        const sourcePlaceholders = sourceArray.map(() => `$${paramCounter++}`).join(', ');
        whereClause += ` AND data_source IN (${sourcePlaceholders})`;
        queryParams.push(...sourceArray);
      }
    }

    // Add date range filter if provided
    if (startDate) {
      whereClause += ` AND created_at >= $${paramCounter++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramCounter++}`;
      queryParams.push(endDate);
    }
    
    // Add emotion filters if provided - improved handling
    if (emotions && emotions.length > 0) {
      const emotionArray = emotions.split(',').filter(emotion => 
        emotion && emotion.trim() !== '' && emotion.trim() !== 'All'
      );
      
      // Only apply emotion filter if there are specific emotions (not 'All')
      if (emotionArray.length > 0) {
        const emotionConditions = emotionArray.map(emotion => {
          // Convert to lowercase for case-insensitive matching
          const emotionLower = emotion.toLowerCase();
          return `LOWER(dominant_emotion) = LOWER($${paramCounter++})`;
        });
        
        if (emotionConditions.length > 0) {
          whereClause += ` AND (${emotionConditions.join(' OR ')})`;
          queryParams.push(...emotionArray);
        }
      }
    }
    
    // First, get the total count
    console.log("Count query where clause:", whereClause);
    console.log("Count query params:", queryParams);
    const countQuery = `SELECT COUNT(*) as total FROM rawdata_with_emotion WHERE ${whereClause}`;
    const totalResult = await db.query(countQuery, queryParams);
    const totalCount = parseInt(totalResult.rows[0].total);
    
    // Query to count dominant emotions
    const sqlQuery = `
      SELECT 
        dominant_emotion,
        COUNT(*) as count
      FROM rawdata_with_emotion
      WHERE ${whereClause}
      GROUP BY dominant_emotion
      ORDER BY count DESC
    `;
    
    console.log("Emotion distribution query:", sqlQuery);
    console.log("Query params:", queryParams);
    
    const emotionResult = await db.query(sqlQuery, queryParams);
    
    // Query for texts of each emotion (limited to 10 per emotion)
    let emotionTextQuery = `
      WITH ranked_texts AS (
        SELECT 
          text_id,
          text,
          dominant_emotion,
          created_at,
          ROW_NUMBER() OVER (PARTITION BY dominant_emotion ORDER BY created_at DESC) as rn
        FROM rawdata_with_emotion
        WHERE ${whereClause}
      )
      SELECT text_id, text, dominant_emotion, created_at
      FROM ranked_texts
      WHERE rn <= 10
      ORDER BY dominant_emotion, created_at DESC
    `;
    
    const textResult = await db.query(emotionTextQuery, queryParams);
    
    // Organize sample texts by emotion
    const textsByEmotion = {};
    textResult.rows.forEach(row => {
      if (!textsByEmotion[row.dominant_emotion]) {
        textsByEmotion[row.dominant_emotion] = [];
      }
      textsByEmotion[row.dominant_emotion].push({
        id: row.text_id,
        text: row.text,
        created_at: row.created_at
      });
    });
    
    // Prepare data for the pie chart
    const emotionData = emotionResult.rows.map(row => ({
      name: row.dominant_emotion,
      value: parseInt(row.count),
      percentage: (parseInt(row.count) / totalCount * 100).toFixed(2),
      sampleTexts: textsByEmotion[row.dominant_emotion] || []
    }));
    
    res.status(200).json({
      emotionData,
      totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint specifically for emotion texts
router.get("/api/emotion-texts", async (req, res, next) => {
  try {
    const { sources, startDate, endDate, emotion } = req.query;
    
    if (!emotion) {
      return res.status(400).json({ error: "Emotion parameter is required" });
    }
    
    // Build query and params
    let whereClause = "dominant_emotion = $1";
    const queryParams = [emotion];
    let paramCounter = 2;
    
    // Add sources filter if provided
    if (sources && sources.length > 0) {
      const sourceArray = sources.split(',').filter(Boolean);
      if (sourceArray.length > 0) {
        const sourcePlaceholders = sourceArray.map(() => `$${paramCounter++}`).join(', ');
        whereClause += ` AND data_source IN (${sourcePlaceholders})`;
        queryParams.push(...sourceArray);
      }
    }

    // Add date range filter if provided
    if (startDate) {
      whereClause += ` AND created_at >= $${paramCounter++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramCounter++}`;
      queryParams.push(endDate);
    }
    
    // Query for all texts with this emotion
    const sqlQuery = `
      SELECT 
        text_id as id, 
        text, 
        created_at, 
        data_source
      FROM rawdata_with_emotion
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(sqlQuery, queryParams);
    
    res.status(200).json({
      texts: result.rows,
      count: result.rowCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// New endpoint for emotion pie chart data using max emotion values
router.get("/api/emotion-max-distribution", async (req, res, next) => {
  try {
    const { sources, startDate, endDate, emotions } = req.query;
    
    // Build WHERE clause and params
    let whereClause = "1=1";
    const queryParams = [];
    let paramCounter = 1;
    
    // Add sources filter if provided
    if (sources && sources.length > 0) {
      const sourceArray = sources.split(',').filter(Boolean);
      if (sourceArray.length > 0) {
        const sourcePlaceholders = sourceArray.map(() => `$${paramCounter++}`).join(', ');
        whereClause += ` AND data_source IN (${sourcePlaceholders})`;
        queryParams.push(...sourceArray);
      }
    }

    // Add date range filter if provided
    if (startDate) {
      whereClause += ` AND created_at >= $${paramCounter++}`;
      queryParams.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND created_at <= $${paramCounter++}`;
      queryParams.push(endDate);
    }
    
    // Add emotion filters if provided
    if (emotions && emotions.length > 0) {
      const emotionArray = emotions.split(',').filter(emotion => 
        emotion && emotion.trim() !== '' && emotion.trim() !== 'All'
      );
      
      // Only apply emotion filter if there are specific emotions (not 'All')
      if (emotionArray.length > 0) {
        const emotionConditions = [];
        
        emotionArray.forEach(emotion => {
          const emotionLower = emotion.toLowerCase();
          
          // For each emotion, check if it's the maximum emotion in a text
          switch(emotionLower) {
            case 'anger':
              emotionConditions.push(`anger > GREATEST(anticipation, disgust, fear, joy, sadness, surprise, trust)`);
              break;
            case 'anticipation':
              emotionConditions.push(`anticipation > GREATEST(anger, disgust, fear, joy, sadness, surprise, trust)`);
              break;
            case 'disgust':
              emotionConditions.push(`disgust > GREATEST(anger, anticipation, fear, joy, sadness, surprise, trust)`);
              break;
            case 'fear':
              emotionConditions.push(`fear > GREATEST(anger, anticipation, disgust, joy, sadness, surprise, trust)`);
              break;
            case 'joy':
              emotionConditions.push(`joy > GREATEST(anger, anticipation, disgust, fear, sadness, surprise, trust)`);
              break;
            case 'sadness':
              emotionConditions.push(`sadness > GREATEST(anger, anticipation, disgust, fear, joy, surprise, trust)`);
              break;
            case 'surprise':
              emotionConditions.push(`surprise > GREATEST(anger, anticipation, disgust, fear, joy, sadness, trust)`);
              break;
            case 'trust':
              emotionConditions.push(`trust > GREATEST(anger, anticipation, disgust, fear, joy, sadness, surprise)`);
              break;
          }
        });
        
        if (emotionConditions.length > 0) {
          whereClause += ` AND (${emotionConditions.join(' OR ')})`;
        }
      }
    }
    
    // First, get the total count of texts
    const countQuery = `SELECT COUNT(*) as total FROM rawdata_with_emotion WHERE ${whereClause}`;
    const totalResult = await db.query(countQuery, queryParams);
    const totalCount = parseInt(totalResult.rows[0].total);
    
    // Query to count texts by their maximum emotion
    const sqlQuery = `
      SELECT 
        CASE
          WHEN anger > GREATEST(anticipation, disgust, fear, joy, sadness, surprise, trust) THEN 'Anger'
          WHEN anticipation > GREATEST(anger, disgust, fear, joy, sadness, surprise, trust) THEN 'Anticipation'
          WHEN disgust > GREATEST(anger, anticipation, fear, joy, sadness, surprise, trust) THEN 'Disgust'
          WHEN fear > GREATEST(anger, anticipation, disgust, joy, sadness, surprise, trust) THEN 'Fear'
          WHEN joy > GREATEST(anger, anticipation, disgust, fear, sadness, surprise, trust) THEN 'Joy'
          WHEN sadness > GREATEST(anger, anticipation, disgust, fear, joy, surprise, trust) THEN 'Sadness'
          WHEN surprise > GREATEST(anger, anticipation, disgust, fear, joy, sadness, trust) THEN 'Surprise'
          WHEN trust > GREATEST(anger, anticipation, disgust, fear, joy, sadness, surprise) THEN 'Trust'
          ELSE 'Mixed'
        END as max_emotion,
        COUNT(*) as count
      FROM rawdata_with_emotion
      WHERE ${whereClause}
      GROUP BY max_emotion
      ORDER BY count DESC
    `;
    
    console.log("Max emotion distribution query:", sqlQuery);
    console.log("Query params:", queryParams);
    
    const emotionResult = await db.query(sqlQuery, queryParams);
    
    // Query for sample texts for each max emotion (limited to 10 per emotion)
    let emotionTextQuery = `
      WITH ranked_texts AS (
        SELECT 
          text_id,
          text,
          CASE
            WHEN anger > GREATEST(anticipation, disgust, fear, joy, sadness, surprise, trust) THEN 'Anger'
            WHEN anticipation > GREATEST(anger, disgust, fear, joy, sadness, surprise, trust) THEN 'Anticipation'
            WHEN disgust > GREATEST(anger, anticipation, fear, joy, sadness, surprise, trust) THEN 'Disgust'
            WHEN fear > GREATEST(anger, anticipation, disgust, joy, sadness, surprise, trust) THEN 'Fear'
            WHEN joy > GREATEST(anger, anticipation, disgust, fear, sadness, surprise, trust) THEN 'Joy'
            WHEN sadness > GREATEST(anger, anticipation, disgust, fear, joy, surprise, trust) THEN 'Sadness'
            WHEN surprise > GREATEST(anger, anticipation, disgust, fear, joy, sadness, trust) THEN 'Surprise'
            WHEN trust > GREATEST(anger, anticipation, disgust, fear, joy, sadness, surprise) THEN 'Trust'
            ELSE 'Mixed'
          END as max_emotion,
          created_at,
          anger, anticipation, disgust, fear, joy, sadness, surprise, trust,
          ROW_NUMBER() OVER (PARTITION BY 
            CASE
              WHEN anger > GREATEST(anticipation, disgust, fear, joy, sadness, surprise, trust) THEN 'Anger'
              WHEN anticipation > GREATEST(anger, disgust, fear, joy, sadness, surprise, trust) THEN 'Anticipation'
              WHEN disgust > GREATEST(anger, anticipation, fear, joy, sadness, surprise, trust) THEN 'Disgust'
              WHEN fear > GREATEST(anger, anticipation, disgust, joy, sadness, surprise, trust) THEN 'Fear'
              WHEN joy > GREATEST(anger, anticipation, disgust, fear, sadness, surprise, trust) THEN 'Joy'
              WHEN sadness > GREATEST(anger, anticipation, disgust, fear, joy, surprise, trust) THEN 'Sadness'
              WHEN surprise > GREATEST(anger, anticipation, disgust, fear, joy, sadness, trust) THEN 'Surprise'
              WHEN trust > GREATEST(anger, anticipation, disgust, fear, joy, sadness, surprise) THEN 'Trust'
              ELSE 'Mixed'
            END 
          ORDER BY created_at DESC) as rn
        FROM rawdata_with_emotion
        WHERE ${whereClause}
      )
      SELECT 
        text_id, 
        text, 
        max_emotion, 
        created_at,
        anger, anticipation, disgust, fear, joy, sadness, surprise, trust
      FROM ranked_texts
      WHERE rn <= 10
      ORDER BY max_emotion, created_at DESC
    `;
    
    const textResult = await db.query(emotionTextQuery, queryParams);
    
    // Organize sample texts by emotion and calculate average emotion values
    const textsByEmotion = {};
    const emotionAvgsByEmotion = {};
    
    textResult.rows.forEach(row => {
      if (!textsByEmotion[row.max_emotion]) {
        textsByEmotion[row.max_emotion] = [];
        emotionAvgsByEmotion[row.max_emotion] = {
          anger: 0,
          anticipation: 0,
          disgust: 0,
          fear: 0,
          joy: 0,
          sadness: 0,
          surprise: 0,
          trust: 0,
          count: 0
        };
      }
      
      // Add text to sample texts
      textsByEmotion[row.max_emotion].push({
        id: row.text_id,
        text: row.text,
        created_at: row.created_at,
        emotions: {
          anger: parseFloat(row.anger),
          anticipation: parseFloat(row.anticipation),
          disgust: parseFloat(row.disgust),
          fear: parseFloat(row.fear),
          joy: parseFloat(row.joy),
          sadness: parseFloat(row.sadness),
          surprise: parseFloat(row.surprise),
          trust: parseFloat(row.trust)
        }
      });
      
      // Sum emotion values for averaging later
      emotionAvgsByEmotion[row.max_emotion].anger += parseFloat(row.anger);
      emotionAvgsByEmotion[row.max_emotion].anticipation += parseFloat(row.anticipation);
      emotionAvgsByEmotion[row.max_emotion].disgust += parseFloat(row.disgust);
      emotionAvgsByEmotion[row.max_emotion].fear += parseFloat(row.fear);
      emotionAvgsByEmotion[row.max_emotion].joy += parseFloat(row.joy);
      emotionAvgsByEmotion[row.max_emotion].sadness += parseFloat(row.sadness);
      emotionAvgsByEmotion[row.max_emotion].surprise += parseFloat(row.surprise);
      emotionAvgsByEmotion[row.max_emotion].trust += parseFloat(row.trust);
      emotionAvgsByEmotion[row.max_emotion].count++;
    });
    
    // Calculate averages
    Object.keys(emotionAvgsByEmotion).forEach(emotion => {
      const counts = emotionAvgsByEmotion[emotion].count;
      if (counts > 0) {
        emotionAvgsByEmotion[emotion].anger /= counts;
        emotionAvgsByEmotion[emotion].anticipation /= counts;
        emotionAvgsByEmotion[emotion].disgust /= counts;
        emotionAvgsByEmotion[emotion].fear /= counts;
        emotionAvgsByEmotion[emotion].joy /= counts;
        emotionAvgsByEmotion[emotion].sadness /= counts;
        emotionAvgsByEmotion[emotion].surprise /= counts;
        emotionAvgsByEmotion[emotion].trust /= counts;
      }
    });
    
    // Prepare data for the pie chart
    const emotionData = emotionResult.rows.map(row => ({
      name: row.max_emotion,
      value: parseInt(row.count),
      percentage: (parseInt(row.count) / totalCount * 100).toFixed(2),
      sampleTexts: textsByEmotion[row.max_emotion] || [],
      emotionAvgs: emotionAvgsByEmotion[row.max_emotion] || {}
    }));
    
    res.status(200).json({
      emotionData,
      totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
