//Neon PostgreSQL pool
const { Pool } = require('pg');
//pg is the Node.js PostgreSQL driver. We destructure Pool from it.
// A Pool is a collection of database connections kept open and ready. 
// Instead of opening and closing a connection for every single request (slow), the pool maintains say 10
//  open connections and hands them out as needed. Much faster.

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
//Creates the pool using your Neon connection string from .env. 
//The ssl part is required for Neon — all cloud PostgreSQL providers require encrypted connections.
//  rejectUnauthorized: false means "use SSL but don't verify the certificate chain" — fine for a portfolio project, and Neon's certificates are valid anyway.

pool.on('connect', () => {
  console.log('✅ Connected to Neon PostgreSQL');
});
//Event listener — fires every time a new connection is established to Neon.
//  Just for your visibility in the terminal.
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});
//Event listener — fires every time an error occurs with the pool.-If a connection in the pool dies unexpectedly 
// (Neon timeout, network blip), this catches it and logs it instead of crashing the server.

const query = (text, params) => pool.query(text, params);
//A helper function that wraps pool.query(). Instead of importing pool everywhere and calling pool.query(), 
// services just import query and call it directly. 
// Cleaner syntax. text is your SQL string, params is an array of values (prevents SQL injection).

module.exports = { pool, query };
//Exports both — query for everyday use in services,
//  pool for the migration script which needs to call pool.end() to close all connections when done.
