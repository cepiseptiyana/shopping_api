const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
});

(async () => {
  // Code inside the IIFE
  try {
    const connection = await pool.getConnection();
    console.log("✅ connection ke MySQL Database!");
    connection.release();
  } catch (err) {
    console.log("failed connect database: " + err);
  }
})();

module.exports = pool;
