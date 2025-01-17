const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');

// Initialize the express app
const app = express();
const port = process.env.PORT || 5000; // Use environment variable for port (or default to 5000)

// Use middleware
app.use(cors()); // CORS should be properly configured to allow external requests
app.use(express.json());

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL server IP if needed
  user: 'root',  // Replace with your MySQL username
  password: '',  // Replace with your MySQL password
  database: 'chat_app'
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
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY timestamp ASC', (err, result) => {
    if (err) {
      res.status(500).send('Error retrieving messages');
    } else {
      res.json(result);
    }
  });
});

// Route to add a new message
app.post('/messages', (req, res) => {
  const { username, message } = req.body;

  if (!username || !message) {
    return res.status(400).send('Username and message are required');
  }

  const query = 'INSERT INTO messages (username, message) VALUES (?, ?)';
  db.query(query, [username, message], (err, result) => {
    if (err) {
      res.status(500).send('Error inserting message');
    } else {
      res.status(201).send('Message sent');
    }
  });
});

// Use bodyParser to handle JSON data
app.use(bodyParser.json());

// API to save announcements
app.post('/api/save-announcement', (req, res) => {
    const { announcements, password } = req.body;

    const correctPassword = "admin123";
    if (password !== correctPassword) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const { IT, GA, HR } = announcements;
    const query = 'INSERT INTO announcements (IT, GA, HR) VALUES (?, ?, ?)';
    db.query(query, [IT, GA, HR], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error saving announcement' });
        }
        res.json({ success: true, message: 'Announcement saved successfully' });
    });
});

app.get('/announcement', (req, res) => {
    const query = 'SELECT * FROM announcements ORDER BY timestamp DESC LIMIT 1';
    db.query(query, (err, result) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Error retrieving announcement' });
      } else {
        res.json(result.length > 0 ? result[0] : { announcement: 'No announcements available' });
      }
    });
});

// API to save informational texts
app.post('/api/save-information', (req, res) => {
    const { information, password } = req.body;

    const correctPassword = "admin123";
    if (password !== correctPassword) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const query = 'INSERT INTO information (text) VALUES (?)';
    db.query(query, [information], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error saving information' });
        }
        res.json({ success: true, message: 'Information saved successfully' });
    });
});

app.get('/information', (req, res) => {
    const query = 'SELECT * FROM information ORDER BY timestamp DESC LIMIT 1';
    db.query(query, (err, result) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Error retrieving information' });
      } else {
        res.json(result.length > 0 ? result[0] : { information: 'No information available' });
      }
    });
});

// API to get the hostname and user IP
app.get('/get-hostname', (req, res) => {
    const hostName = os.hostname(); // Get the server's hostname
    const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Get the user's IP
    res.json({ hostName, userIP });
});

// Start the server to accept external connections
app.listen(port, '0.0.0.0', () => {  // Listen on all interfaces
  console.log(`Server is running on port ${port}`);
});
