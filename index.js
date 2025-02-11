const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Pole pro ukládání zpráv v paměti
const messages = [];

// Middleware pro zpracování formulářových dat
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Obsloužení hlavní stránky
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Přijetí zprávy a její uložení do paměti
app.post('/send', (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) {
        return res.status(400).send('Jméno a zpráva jsou povinné!');
    }

    // Uložení zprávy do paměti
    messages.push({ username, message, timestamp: new Date().toLocaleString() });

    res.redirect('/');
});

// API pro získání zpráv s filtrováním
app.get('/messages', (req, res) => {
    const search = req.query.search?.toLowerCase() || "";

    // Filtrování zpráv podle hledaného řetězce
    const filteredMessages = messages.filter(msg =>
        msg.message.toLowerCase().includes(search) || 
        msg.username.toLowerCase().includes(search)
    );

    res.json(filteredMessages);
});

// Spuštění serveru
app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
