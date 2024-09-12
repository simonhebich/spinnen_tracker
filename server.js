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

// Write data to the JSON file
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing the data file:', error);
  }
}

// API to get the current sighting data and log
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// API to reset the sighting and log the new sighting
app.post('/api/reset', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const data = readData();
  const newLogEntry = { time: new Date().toISOString(), name };

  // Update the last sighting time and add the new entry to the log
  data.lastSighting = Date.now();
  data.log.unshift(newLogEntry);

  // Keep only the last 10 entries
  if (data.log.length > 10) {
    data.log.pop();
  }

  writeData(data);
  res.json({ message: 'Sighting reset', data });
});

// Create an HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
