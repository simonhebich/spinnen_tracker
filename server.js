const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = express();
const PORT = 443;

// Load SSL certificate and key
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert'))
};

app.use(express.json());
app.use(express.static('public')); // Serve the frontend from the public folder

const DATA_FILE = './data.json';

// Read data from the JSON file
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading the data file:', error);
    return { lastSighting: Date.now(), log: [] };
  }
}

// API to get the current sighting data and log
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// Create an HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
