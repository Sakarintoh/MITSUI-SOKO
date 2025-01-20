require('dotenv').config(); // โหลด environment variables
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');

// Initialize the express app
const app = express();
const port = process.env.PORT || 5000; // ใช้พอร์ตจาก environment หรือ 5000 ถ้าไม่มี

// Use middleware
app.use(cors());
app.use(express.json());

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

// Route to get all messages
app.get('/messages', async (req, res) => {
  try {
    const [result] = await db.promise().query('SELECT * FROM messages ORDER BY timestamp ASC');
    res.json(result);
  } catch (err) {
    res.status(500).send('Error retrieving messages');
  }
});

// Route to add a new message
app.post('/messages', async (req, res) => {
  const { username, message } = req.body;

  if (!username || !message) {
    return res.status(400).send('Username and message are required');
  }

  const query = 'INSERT INTO messages (username, message) VALUES (?, ?)';
  try {
    await db.promise().query(query, [username, message]);
    res.status(201).send('Message sent');
  } catch (err) {
    res.status(500).send('Error inserting message');
  }
});

// API to save announcements
app.post('/api/save-announcement', async (req, res) => {
  const { announcements, password } = req.body;

  const correctPassword = "admin123";
  if (password !== correctPassword) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }

  const { IT, GA, HR } = announcements;
  const query = 'INSERT INTO announcements (IT, GA, HR) VALUES (?, ?, ?)';
  try {
    await db.promise().query(query, [IT, GA, HR]);
    res.json({ success: true, message: 'Announcement saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving announcement' });
  }
});

app.get('/announcement', async (req, res) => {
  const query = 'SELECT * FROM announcements ORDER BY timestamp DESC LIMIT 1';
  try {
    const [result] = await db.promise().query(query);
    res.json(result.length > 0 ? result[0] : { announcement: 'No announcements available' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving announcement' });
  }
});

// API to save informational texts
app.post('/api/save-information', async (req, res) => {
  const { information, password } = req.body;

  const correctPassword = "admin123";
  if (password !== correctPassword) {
    return res.status(401).json({ success: false, message: "Incorrect password" });
  }

  const query = 'INSERT INTO information (text) VALUES (?)';
  try {
    await db.promise().query(query, [information]);
    res.json({ success: true, message: 'Information saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error saving information' });
  }
});

app.get('/information', async (req, res) => {
  const query = 'SELECT * FROM information ORDER BY timestamp DESC LIMIT 1';
  try {
    const [result] = await db.promise().query(query);
    res.json(result.length > 0 ? result[0] : { information: 'No information available' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving information' });
  }
});

app.get('/get-hostname', (req, res) => {
  const hostName = os.hostname(); // ดึงชื่อ Host ของเซิร์ฟเวอร์
  const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // ดึง IP ของผู้ใช้
  res.json({ hostName, userIP });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
