const express = require('express');
const fs = require('fs');
const https = require('https');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = 443;

// SSL certificate and key
const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.cert'))
};

app.use(express.json());
app.use(express.static('public')); // Serve static frontend files

const DATA_FILE = './data.json';

// Read data from the JSON file, including alarm status
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { lastSighting: Date.now(), log: [], alarmActive: false };  // Add default alarm state
  }
}

// Write data to the JSON file, including alarm status
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data file:', error);
  }
}

// Send email notifications
async function sendAlarmEmail() {
  // Set up transport configuration for nodemailer
  let transporter = nodemailer.createTransport({
    service: 'Gmail',  // You can use any SMTP server here
    auth: {
      user: 'spinnennews@gmail.com', // Use your email here
      pass: 'Tc*GMt7RwWJ2l6'   // Your email password or app-specific password for Gmail
    }
  });

  const mailOptions = {
    from: 'spinnennews@gmail.com',  // Sender address
    to: 'simon.hebich@pm.me, vajubangert@gmail.com',  // List of recipients
    subject: 'SPINNEN-ALARM!',  // Subject line
    text: 'Achtung! Die Spinne ist weg!',  // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Alarm email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// API to trigger alarm and send email
app.post('/api/trigger-alarm', (req, res) => {
  const data = readData();
  data.alarmActive = true;  // Set alarm to active
  writeData(data);          // Save the alarm status

  sendAlarmEmail();         // Send out email notifications
  res.json({ message: 'Alarm triggered!' });
});

// API to check the current alarm status
app.get('/api/alarm-status', (req, res) => {
  const data = readData();
  res.json({ alarmActive: data.alarmActive });
});

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server running at https://localhost:${PORT}`);
});
