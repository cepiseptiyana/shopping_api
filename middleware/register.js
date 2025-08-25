const pool = require("../database/database.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const connection = await pool.getConnection();

  // if (!username) {
  //   return res.status(400).json({ message: "username wajib isi" });
  // }

  // if (!email) {
  //   return res.status(400).json({ message: "email wajib isi" });
  // }

  // if (!password) {
  //   return res.status(400).json({ message: "password wajib isi" });
  // }

  try {
    const [rows] = await connection.query(
      "SELECT * FROM accounts WHERE username = ? OR email = ?",
      [username, email]
    );

    if (rows.length > 0) {
      const user = rows[0];
      if (user.username === username)
        return res.status(400).json({ message: "Username sudah dipakai" });
      if (user.email === email)
        return res.status(400).json({ message: "Email sudah dipakai" });
    }

    // Hashing password
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);

    // Insert user
    await connection.query(
      "INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)",
      [username, email, hash]
    );

    res.status(201).json({ message: "Horee, Created account" + username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    // penting: selalu release connection biar balik ke pool
    connection.release();
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      "SELECT * FROM accounts WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) return res.status(400).json({ message: "password salah" });
      return res.status(200).json({ message: "login" });
    }

    return res.status(400).json({ message: "email atau password salah" });
  } catch (err) {
    return res.status(500).json({ message: "server error" + err });
  } finally {
    connection.release();
  }
};
