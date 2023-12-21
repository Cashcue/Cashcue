const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 8000;

const db = mysql.createConnection({
  host: 'localhost', 
  user: 'username_mysql', //ganti sesuai username di DB
  password: 'password_mysql', //ganti sesuai password di DB
  database: 'nama_database_mysql' // ganti nama DB yang sesuai
});

db.connect((err) => {
  if (err) {
    console.error('Koneksi ke MySQL gagal: ' + err.stack);
    return;
  }
  console.log('Terhubung ke MySQL dengan ID ' + db.threadId);
});

app.use(bodyParser.json());

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Rute untuk Register
app.post('/register', (req, res) => {
  const { email, password } = req.body; //ganti sesuai tabel
  const hashedPassword = bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (email, password) VALUES (?, ?)', 
    //ganti sesuai tabel (email dll). untuk VALUES (?(tergantung jumlah request) ? adalah variabel input mewakili setiap request yang masuk)
    [email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({token, message: 'Gagal saat mendaftar'});
      } else {
        res.status(201).json({token, message: 'Pendaftaran Berhasil!'});
      }
    }
  );
});

// Rute untuk Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
//   email = 'havidz@gmail.com'
//   password = 'havidz123'

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan saat login');
      } else if (result.length > 0) {
        const match = await bcrypt.compare(password, result[0].password);
        if (match) {
          const token = jwt.sign({ email }, process.env.JWT_SECRET || 'default_secret_key', { expiresIn: '1h' });
          res.header('Authorization', `Bearer ${token}`).json({token, message: 'Login berhasil!'});
        } else {
          res.status(401).json({token, message: 'Kata sandi salah!'});
        }
      } else {
        res.status(404).json({token, message: 'Pengguna tidak ditemukan'});
      }
    }
  );
});
//FYI download POSTMAN untuk cek authentikasi login dan register

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

//untuk melakukan running server = node index.js