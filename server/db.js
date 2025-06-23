import {Pool} from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),

  ssl: { rejectUnauthorized: false } // required on Render
});
async function initialize() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crypto_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      api_key text,
      api_secret text
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trades (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES crypto_users(id),
      symbol VARCHAR(20) NOT NULL,
      side VARCHAR(4) NOT NULL,
      price NUMERIC(20, 8) NOT NULL,
      quantity NUMERIC(20, 8) NOT NULL,
      order_id text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      
    );
  `);
  console.log('✅  table is ready');
}

initialize().catch(console.error);
export default pool;
