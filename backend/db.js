import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Kets.8865',
  database: process.env.DB_NAME || 'airlinemanagementsystem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and print status
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    console.log('Make sure MySQL server is running, the database exists, and the credentials in backend/.env are correct.');
  }
})();

export default pool;
