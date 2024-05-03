const { Pool, Client } = require("pg");
require('dotenv').config();
const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  }, // default Postgres port
  // database: "-",
});
client.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("We're connected to the database");
  }
});
module.exports = client;
