# 📝 Node Messenger - Jednoduchý chatovací server s Express.js

Tento projekt je jednoduchá chatovací aplikace, která umožňuje uživatelům:
- Odesílat zprávy prostřednictvím formuláře.
- Zobrazovat seznam odeslaných zpráv.
- Filtrovat zprávy podle zadaného klíčového slova.

## 📌 Požadavky
- **Node.js** (doporučeno: poslední verze)
- **NPM** (správce balíčků)

---

## 🟢 Fáze 1: Vytvoření kostry projektu

### 1️⃣ Vytvoření projektu
```sh
mkdir node-messenger
cd node-messenger
npm init -y
npm install express body-parser
```

### 2️⃣ Vytvoření základního serveru
Vytvoříme soubor **`server.js`**:
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('<h1>Vítejte v jednoduchém chatu</h1>');
});

app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
```

### 3️⃣ Spuštění serveru
```sh
node server.js
```
Otevřete [http://localhost:3000](http://localhost:3000) v prohlížeči.

---

## 🟢 Fáze 2: Přidání formuláře a odesílání dat na server

### 1️⃣ Vytvoření složky pro statické soubory
```sh
mkdir public
```
Vytvoříme soubor **`public/index.html`**:
```html
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <title>Jednoduchý chat</title>
</head>
<body>
    <h1>Jednoduchý chat</h1>
    <form action="/send" method="post">
        <input type="text" name="username" placeholder="Vaše jméno" required>
        <textarea name="message" placeholder="Napište zprávu..." required></textarea>
        <button type="submit">Odeslat</button>
    </form>
</body>
</html>
```

### 2️⃣ Úprava serveru pro zpracování formuláře
```javascript
const bodyParser = require('body-parser');
const messages = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/send', (req, res) => {
    const { username, message } = req.body;
    messages.push({ username, message, timestamp: new Date().toLocaleString() });
    res.redirect('/');
});
```

---

## 🟢 Fáze 3: Zobrazování zpráv

### 1️⃣ Úprava `index.html`
Přidáme sekci pro zobrazení zpráv:
```html
<h2>Seznam zpráv</h2>
<div id="messages"></div>

<script>
    async function loadMessages() {
        const response = await fetch('/messages');
        const messages = await response.json();
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = messages.map(msg =>
            `<div><strong>${msg.username}</strong>: ${msg.message} <small>(${msg.timestamp})</small></div>`
        ).join('');
    }
    
    loadMessages();
    setInterval(loadMessages, 5000);
</script>
```

### 2️⃣ Úprava serveru pro vrácení zpráv
```javascript
app.get('/messages', (req, res) => {
    res.json(messages);
});
```
🔹 **Zprávy se každých 5 sekund automaticky aktualizují!**

---

## 🟢 Fáze 4: Filtrování zpráv

### 1️⃣ Úprava `index.html` – Přidání vyhledávacího pole
```html
<input type="text" id="search" placeholder="Hledat ve zprávách..." oninput="loadMessages()">

<script>
    async function loadMessages() {
        const searchQuery = document.getElementById('search').value;
        const response = await fetch('/messages?search=' + encodeURIComponent(searchQuery));
        const messages = await response.json();
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = messages.length
            ? messages.map(msg =>
                `<div><strong>${msg.username}</strong>: ${msg.message} <small>(${msg.timestamp})</small></div>`
            ).join('')
            : '<p>Žádné odpovídající zprávy.</p>';
    }

    loadMessages();
</script>
```

### 2️⃣ Úprava serveru pro filtrování zpráv
```javascript
app.get('/messages', (req, res) => {
    const search = req.query.search?.toLowerCase() || "";
    const filteredMessages = messages.filter(msg =>
        msg.message.toLowerCase().includes(search) || 
        msg.username.toLowerCase().includes(search)
    );
    res.json(filteredMessages);
});
```

---
