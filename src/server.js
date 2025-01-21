const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const os = require('os');
const WebSocket = require('ws');  // Import WebSocket

// Initialize the express app
const app = express();
const port = 5000;

// Use middleware
app.use(cors()); // Allow requests from any domain
app.use(express.json()); // Use built-in JSON parser (no need for body-parser)

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost', // Database host
  user: 'root',      // MySQL username
  password: '12345678',      // MySQL password
  database: 'chat_app' // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Stop the server if the database connection fails
  }
  console.log('Connected to the MySQL database');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ noServer: true });

// When a new client connects via WebSocket
wss.on('connection', (ws) => {
  console.log('A new WebSocket client connected');

  // Send an initial message to the client if needed
  ws.send(JSON.stringify({ type: 'info', message: 'Welcome to the WebSocket server!' }));

  // Handle incoming messages from the client
  ws.on('message', (message) => {
    console.log('Received message:', message);
    // Handle the message received from the client (you can implement more logic here)
  });
});

// When there is a change in the database (new message, new announcement, etc.), notify all clients
const notifyClients = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Route to get all messages
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY timestamp ASC', (err, result) => {
    if (err) {
      return res.status(500).send('Error retrieving messages');
    }
    res.json(result);
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
      return res.status(500).send('Error inserting message');
    }

    // Notify all connected WebSocket clients about the new message
    notifyClients({ type: 'message', username, message });

    res.status(201).send('Message sent');
  });
});

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

    // Notify all connected WebSocket clients about the new announcement
    notifyClients({ type: 'announcement', IT, GA, HR });

    res.json({ success: true, message: 'Announcement saved successfully' });
  });
});

// API to retrieve the latest announcement
app.get('/announcement', (req, res) => {
  const query = 'SELECT * FROM announcements ORDER BY timestamp DESC LIMIT 1';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error retrieving announcement' });
    }
    res.json(result.length > 0 ? result[0] : { announcement: 'No announcements available' });
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

    // Notify all connected WebSocket clients about the new information
    notifyClients({ type: 'information', text: information });

    res.json({ success: true, message: 'Information saved successfully' });
  });
});

// API to retrieve the latest information
app.get('/information', (req, res) => {
  const query = 'SELECT * FROM information ORDER BY timestamp DESC LIMIT 1';
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error retrieving information' });
    }
    res.json(result.length > 0 ? result[0] : { information: 'No information available' });
  });
});

// API to get Host Name or IP Address of the user
app.get('/get-hostname', (req, res) => {
  const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Get IP
  const hostName = os.hostname(); // Hostname of the server (not user)

  res.json({ userIP, hostName });
});

// Upgrade the HTTP server to support WebSockets
app.server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});

app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
