const { Pool, Client } = require("pg");

const client = new Client({
  user: "",
  password: "",
  host: "",
  port: 5432,
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
