const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Damit das Frontend unter /public zugänglich ist

const DATA_FILE = './data.json';

// Lese die Daten aus der JSON-Datei
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (error) {
        console.error('Fehler beim Lesen der Datei:', error);
        return { lastSighting: Date.now(), log: [] };
    }
}

// Schreibe die Daten in die JSON-Datei
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fehler beim Schreiben der Datei:', error);
    }
}

// API zum Abrufen der aktuellen Daten (letzte Sichtung und Log)
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// API zum Zurücksetzen der Sichtung und Speichern der neuen Sichtung
app.post('/api/reset', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name ist erforderlich' });
    }

    const data = readData();
    const newLogEntry = { time: new Date().toISOString(), name };

    // Aktualisiere die letzte Sichtung und füge den neuen Eintrag zum Log hinzu
    data.lastSighting = Date.now();
    data.log.unshift(newLogEntry);

    // Halte das Log auf maximal 10 Einträge beschränkt
    if (data.log.length > 10) {
        data.log.pop();
    }

    writeData(data);
    res.json({ message: 'Sichtung zurückgesetzt', data });
});

// Starte den Server
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});