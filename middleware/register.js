const jwt = require("jsonwebtoken");
const pool = require("../database/database.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const connection = await pool.getConnection();

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
      if (compare) {
        // buat token JWT
        const token = jwt.sign(
          { id: user.id, email: user.email }, // payload (data yg mau dikirim)
          process.env.JWT_SECRET, // secret key simpan di .env
          { expiresIn: "1h" } // expired (misal 1 jam)
        );

        return res.status(200).json({
          message: "login berhasil",
          account_id: user.id,
          username: user.username,
          token: token,
        });
      }
      return res.status(400).json({ message: "password salah" });
    }

    return res.status(400).json({ message: "email atau password salah" });
  } catch (err) {
    return res.status(500).json({ message: "server error" + err });
  } finally {
    connection.release();
  }
};

module.exports.addCart = async (req, res) => {
  const {
    id_barang,
    account_id,
    name,
    quantity,
    price,
    image,
    size,
    stock,
    total_delivery,
    type_delivery,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      "SELECT * FROM items WHERE id_barang = ?",
      [id_barang]
    );

    if (rows.length > 0) {
      const items = rows[0];

      if (size !== items.size || type_delivery !== items.type_delivery) {
        await connection.query(
          "INSERT INTO items (id_barang, account_id, name, quantity, price, image, size, stock, total_delivery, type_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            id_barang,
            account_id,
            name,
            quantity,
            price,
            image,
            size,
            stock,
            total_delivery,
            type_delivery,
          ]
        );

        return res.status(200).json({ message: "Added to cart successfully!" });
      }

      if (quantity !== items.quantity) {
        await connection.query(
          "UPDATE items SET quantity = ? WHERE id_barang = ? AND account_id = ?",
          [quantity, id_barang, account_id]
        );
        return res.status(200).json({ message: "Quantity diperbarui" });
      }
    }

    await connection.query(
      "INSERT INTO items (id_barang, account_id, name, quantity, price, image, size, stock, total_delivery, type_delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id_barang,
        account_id,
        name,
        quantity,
        price,
        image,
        size,
        stock,
        total_delivery,
        type_delivery,
      ]
    );

    res.status(200).json({ message: "Added to cart successfully!" });
  } catch (err) {
    console.log("ada error: " + err);
    return res.status(500).json({ message: "ada server error" + err });
  } finally {
    connection.release();
  }
};

module.exports.getItems = async (req, res) => {
  const { account_id } = req.body;
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      "SELECT * FROM items WHERE account_id = ?",
      [account_id]
    );

    if (rows.length > 0) {
      // rows[0] hanya akan mengabil satu data
      // const item = rows[0];
      return res.status(200).json({ success: true, data: rows });
    }

    res.status(400).json({ success: false, data: [] });
  } catch (err) {
    console.log("ada error: " + err);
    return res
      .status(500)
      .json({ success: false, message: "ada server error" + err });
  } finally {
    connection.release();
  }
};

module.exports.updateQuantity = async (req, res) => {
  const { id, quantity, account_id } = req.body;
  const connection = await pool.getConnection();

  try {
    const [result] = await connection.query(
      "UPDATE items SET quantity = ? WHERE id = ? AND account_id = ?",
      [quantity, id, account_id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "success update" });
    }

    return res
      .status(400)
      .json({ message: "gagal update / data tidak ditemukan" });
  } catch (err) {
    console.error("ada error: " + err);
    return res.status(500).json({ message: "ada server error: " + err });
  } finally {
    connection.release();
  }
};
