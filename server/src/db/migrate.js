// run schema against Neon

require('dotenv').config();
//Must be first — loads .env so DATABASE_URL is available when database.js tries to connect.


const fs = require('fs');
const path = require('path');
//fs = Node.js file system module — reads files from disk. path = handles file paths in a cross-platform way. path.join(__dirname, 'schema.sql') works on both Windows (\) and Mac/Linux (/).

const { pool } = require('./database');
//Imports the pool (not query) specifically because we need pool.end() at the end to close all connections. A standalone script needs to shut down cleanly — unlike the server which stays running forever.

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  //Reads schema.sql from disk as a string. readFileSync is synchronous — it waits until the file is fully read before continuing. utf8 means return it as a text string, not a binary buffer.
  
  try {
    console.log('Running migrations against Neon...');
    await pool.query(sql);
    console.log('✅ Tables created: watchlist, portfolio, alerts');
    //Sends the entire SQL string to Neon in one go. PostgreSQL can handle multiple CREATE TABLE statements in one query. The await waits for Neon to confirm all tables were created.
	} catch (err) {
    console.error('Migration failed:', err.message);//If anything goes wrong (wrong password, network error, bad SQL), this catches it and shows a readable error. Without this, you'd just see an unhandled promise rejection.
	} finally {
    await pool.end();
  }
}
migrate();
//finally runs whether the migration succeeded or failed — always closes the pool. Without this, the script would hang forever waiting for connections to close. migrate() at the bottom immediately calls the function when the script runs.