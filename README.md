# 📝 Node Messenger - Jednoduchý chatovací server s Express.js

Tento projekt je jednoduchá chatovací aplikace, která umožňuje uživatelům:
- Odesílat zprávy prostřednictvím formuláře.
- Zobrazovat seznam odeslaných zpráv.
- Filtrovat zprávy podle zadaného klíčového slova.

## 📌 Obsah

- [Založení projektu](#zalozeni-projektu)
- [Podrobné vysvětlení projektu Node.js Messenger](#projekt)
- [Podrobný rozbor souboru `index.js`](#index-js)
- [Podrobný rozbor souboru `index.html`](#index-html)
- [Podrobný rozbor modulu `jsonStorage.js`](#json-storage)
- [Podrobný rozbor modulu `sqliteStorage.js`](#sqlite-storage)
- [Synchronní vs. Asynchronní programování na příkladu restaurace](#sync-async)
- [JSON – Co to je a jak ho využít?](#json)

---
# 📌 Založení projektu <a id="zalozeni-projektu"></a>

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
node index.js
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

# **📌 Podrobné vysvětlení projektu Node.js Messenger** <a id="projekt"></a>

Tento projekt je **jednoduchý chatovací server**, který umožňuje uživatelům **odesílat zprávy**, zobrazovat je na webové stránce a ukládat je buď **do souboru (JSON), nebo do databáze (SQLite)**.

---

## **🛠 Jak to funguje? (Stručný přehled)**  
1️⃣ **Uživatel otevře stránku** (`index.html`).  
2️⃣ **Vyplní formulář se zprávou a odešle ji**.  
3️⃣ **Server zprávu přijme a uloží ji** (buď do JSON, nebo do SQLite).  
4️⃣ **Zprávy se zobrazují na stránce** a jsou automaticky aktualizovány.  

---

## **📂 Přehled souborů projektu**
📂 **`index.html`** → Webová stránka chatu  
📂 **`index.js`** → Hlavní soubor serveru (Express.js)  
📂 **`jsonStorage.js`** → Ukládání zpráv do JSON souboru  
📂 **`sqliteStorage.js`** → Ukládání zpráv do SQLite databáze  

---

## **📜 1️⃣ Frontend: Webová stránka `index.html`**
📌 **Tato stránka obsahuje:**  
✔ Formulář pro odesílání zpráv  
✔ Seznam zpráv  
✔ Automatické načítání zpráv každých 5 sekund  

📄 **Jak funguje formulář?**
- Když uživatel vyplní jméno a zprávu a klikne na **Odeslat**, data se pošlou na server (`/send`).
- Stránka pak automaticky načítá zprávy z `/messages`.

📄 **Jak se zprávy aktualizují?**
```javascript
async function loadMessages() {
    const response = await fetch('/messages');  // Pošle požadavek na server
    const messages = await response.json();    // Přijme a převede odpověď na JSON
    document.getElementById('messages').innerHTML = messages.map(msg =>
        `<div class="message">
            <strong>${msg.username}</strong>: ${msg.message}
            <small>(${msg.timestamp}) - IP: ${msg.ip}</small>
        </div>`
    ).join('');
}
setInterval(loadMessages, 5000);  // Aktualizace každých 5 sekund
```
💡 **Díky tomu vidí uživatelé nové zprávy i bez obnovování stránky!** 🚀

---

## **🌍 2️⃣ Backend: Hlavní server `index.js`**
📌 **Tento soubor řídí celý server:**  
✔ Přijímá nové zprávy  
✔ Posílá uložené zprávy zpět na webovou stránku  
✔ Ukládá zprávy do JSON nebo SQLite  

📄 **Jak přijímá a ukládá zprávy?**
```javascript
app.post('/send', (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) {
        return res.status(400).send('Jméno a zpráva jsou povinné!');
    }
    
    const userIP = req.headers['x-forwarded-for'] || req.ip;  // Získání IP uživatele
    
    storage.addMessage(username, message, userIP);  // Uloží zprávu do vybrané metody (JSON nebo SQLite)
    
    res.redirect('/');
});
```
💡 **Uživatel tedy pošle zprávu, server ji zpracuje a uloží!**

📄 **Jak se zprávy načítají?**
```javascript
app.get('/messages', (req, res) => {
    let messages = storage.getMessages();
    res.json(messages);
});
```
💡 **Webová stránka pak zprávy z této API cesty získává každých 5 sekund.**

---

## **📝 3️⃣ Možnosti ukládání zpráv**
📌 **Projekt umožňuje dvě varianty ukládání:**  
1️⃣ **Do souboru `messages.json`** 📄  
2️⃣ **Do databáze `messages.db` (SQLite)** 🗄  

📄 **Chceš ukládat do JSON? Odkomentuj:**
```javascript
const storage = require('./storage/jsonStorage');
```
📄 **Chceš ukládat do SQLite? Odkomentuj:**
```javascript
const storage = require('./storage/sqliteStorage');
```

---

## **📂 4️⃣ JSON Storage (`jsonStorage.js`)**
📌 **Zprávy se ukládají do souboru `messages.json`**  

📄 **Jak funguje uložení zprávy?**
```javascript
function addMessage(username, message, ip) {
    const messages = getMessages();
    messages.push({ username, message, timestamp: new Date().toISOString(), ip });
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
}
```
💡 **Každá zpráva se přidá do souboru a uloží!**

---

## **🗄 5️⃣ SQLite Storage (`sqliteStorage.js`)**
📌 **Zprávy se ukládají do databázové tabulky `messages`**  

📄 **Jak se zprávy ukládají?**
```javascript
function addMessage(username, message, ip) {
    db.prepare(`
        INSERT INTO messages (username, message, timestamp, ip)
        VALUES (?, ?, CURRENT_TIMESTAMP, ?)
    `).run(username, message, ip);
}
```
💡 **Každá zpráva se uloží do databáze a zůstane dostupná pro dotazy.**

📄 **Jak se načítají zprávy?**
```javascript
function getMessages() {
    return db.prepare("SELECT * FROM messages ORDER BY timestamp DESC").all();
}
```
💡 **Díky tomu lze zprávy filtrovat a efektivně zobrazovat!**

---
# **🔍 Podrobný rozbor souboru `index.js`** <a id="index-js"></a>

Soubor **`index.js`** je **hlavní soubor serveru**, který řídí celý chatovací systém.  
Používá **Node.js s frameworkem Express.js**, který umožňuje jednoduchou práci s HTTP požadavky.  

---

## **📌 Co dělá `index.js`?**
✅ **Spouští Express server**  
✅ **Zpracovává HTTP požadavky (`GET`, `POST`)**  
✅ **Ukládá zprávy do paměti nebo databáze (SQLite / JSON)**  
✅ **Poskytuje API pro získání zpráv a vyhledávání**  

📌 **Použitá technologie:**  
✔ **Node.js + Express.js** – webový server  
✔ **Body-parser** – zpracování formulářových dat  
✔ **Databázová vrstva** – SQLite nebo JSON soubor  

---

## **📂 1️⃣ Import potřebných modulů**
```javascript
const express = require('express');
const bodyParser = require('body-parser');
```
📌 **Co tyto knihovny dělají?**  
✔ **`express`** – Framework pro HTTP server a routování  
✔ **`body-parser`** – Middleware pro zpracování dat z formulářů  

💡 **Express.js umožňuje jednoduchou práci s webovými aplikacemi a API.**

---

## **🌍 2️⃣ Inicializace serveru a nastavení portu**
```javascript
const app = express();
const PORT = 3000;
```
✔ **`app = express();`** – Vytvoří novou instanci serveru  
✔ **`PORT = 3000;`** – Nastavuje, na jakém portu bude server běžet  

💡 **Server bude dostupný na `http://localhost:3000`.**

---

## **🗄 3️⃣ Výběr způsobu ukládání zpráv**
```javascript
// const storage = require('./storage/jsonStorage'); // JSON soubor
const storage = require('./storage/sqliteStorage'); // SQLite databáze
```
📌 **Uživatel si může vybrat, kam se zprávy budou ukládat:**  
✔ **JSON (`jsonStorage.js`)** – Zprávy se ukládají do souboru `messages.json`  
✔ **SQLite (`sqliteStorage.js`)** – Zprávy se ukládají do databáze  

💡 **Použití SQLite je vhodnější pro větší množství dat, JSON je dobrý pro jednoduché testování.**

---

## **🛠 4️⃣ Middleware – předzpracování požadavků**
```javascript
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
```
📌 **Co dělají tyto řádky?**  
✔ **`body-parser`** – Zpracovává data z formulářů a ukládá je do `req.body`  
✔ **`express.static('public')`** – Umožňuje přístup ke statickým souborům (HTML, CSS, JS)  

💡 **Díky tomu může prohlížeč zobrazit soubory ze složky `public` bez nutnosti psát složitější routy.**

---

## **🌐 5️⃣ Hlavní stránka (`GET /`)**
```javascript
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
```
✔ **Odesílá soubor `index.html` jako odpověď na požadavek uživatele.**  
✔ **`__dirname`** – Vrací cestu ke složce, kde je spuštěn server  

💡 **Díky tomuto kódu se po načtení stránky v prohlížeči zobrazí chatovací rozhraní.**

---

## **✉ 6️⃣ Odesílání zprávy (`POST /send`)**
```javascript
app.post('/send', (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) {
        return res.status(400).send('Jméno a zpráva jsou povinné!');
    }

    const userIP = req.headers['x-forwarded-for'] || req.ip;
    
    let msg = {
        username: username,
        message,
        timestamp: new Date().toISOString(),
        ip: userIP
    };
    messages.push(msg);

    storage.addMessage(msg.username, msg.message, msg.ip);
    res.redirect('/');
});
```
📌 **Co se zde děje?**  
✔ **Přijme data z formuláře (`req.body`)**  
✔ **Ověří, zda jsou vyplněná (`if (!username || !message)`)**  
✔ **Získá IP adresu uživatele (`req.ip`)**  
✔ **Uloží zprávu do paměti (`messages.push()`)**  
✔ **Uloží zprávu do souboru nebo databáze (`storage.addMessage()`)**  
✔ **Přesměruje uživatele zpět na hlavní stránku**  

💡 **Po odeslání formuláře se zpráva uloží a uživatel je přesměrován zpět.**

---

## **🔍 7️⃣ Získání zpráv (`GET /messages`)**
```javascript
app.get('/messages', (req, res) => {
    let messages = storage.getMessages();

    const search = req.query.search.toLowerCase() || "";

    const filteredMessages = messages.filter(msg =>
        msg.message.toLowerCase().includes(search) || 
        msg.username.toLowerCase().includes(search)
    );

    res.json(filteredMessages);
});
```
📌 **Co se zde děje?**  
✔ **Načte všechny zprávy (`storage.getMessages()`)**  
✔ **Zkontroluje, zda uživatel chce filtrovat podle klíčového slova (`req.query.search`)**  
✔ **Vrátí pouze zprávy, které obsahují hledaný text (`filter()`)**  
✔ **Odpoví ve formátu JSON (`res.json(filteredMessages)`)**  

💡 **Díky tomu lze vyhledávat zprávy zadáním `?search=ahoj` do URL.**

---

## **🚀 8️⃣ Spuštění serveru**
```javascript
app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
```
✔ **Spustí server na daném portu (`PORT = 3000`)**  
✔ **Vypíše do konzole, že server běží**  

💡 **Po spuštění tohoto souboru bude chatovací server běžet na `http://localhost:3000`.**

---

## **📌 Shrnutí funkcí souboru `index.js`**
| **Funkce** | **Co dělá?** |
|------------|-------------|
| **Inicializace serveru** | Spouští Express.js server |
| **Middleware** | Zpracovává formulářová data a statické soubory |
| **Hlavní stránka (`/`)** | Vrací soubor `index.html` uživateli |
| **Odeslání zprávy (`POST /send`)** | Přijme zprávu a uloží ji do paměti/databáze |
| **Získání zpráv (`GET /messages`)** | Vrací uložené zprávy v JSON formátu |
| **Filtrování zpráv** | Umožňuje hledat zprávy podle textu |
| **Spuštění serveru** | Poslouchá na portu 3000 a čeká na požadavky |

---

## **💡 Závěr**
✅ **Server je jednoduchý a přehledný – využívá Express.js pro zpracování požadavků.**  
✅ **Používá modulární ukládání zpráv – lze snadno přepínat mezi JSON a SQLite.**  
✅ **Podporuje vyhledávání zpráv pomocí query parametru (`?search=slovo`).**  
✅ **Lze snadno rozšířit o další funkce – např. autentizaci, více místností nebo notifikace.**  

💡 **Tento server tvoří základ chatovací aplikace, kterou lze snadno rozšiřovat! 🚀**

---
# **🔍 Podrobný rozbor souboru `index.html`** <a id="index-html"></a>
Soubor **`index.html`** je jednoduchá webová stránka, která slouží jako uživatelské rozhraní pro chatovací aplikaci.  
Umožňuje **odesílání zpráv**, **zobrazení seznamu zpráv** a **jejich automatickou aktualizaci** každých 5 sekund.  

📌 **Obecné principy, které zde uvidíme:**  
✔ **Struktura HTML dokumentu**  
✔ **Formulář pro odesílání zpráv (`<form>`)**  
✔ **Použití JavaScriptu pro načítání zpráv (Fetch API, asynchronní funkce)**  
✔ **Automatická aktualizace obsahu (`setInterval()`)**  
✔ **Použití `map()` pro dynamické generování HTML kódu**  

---

## **📂 1️⃣ Struktura HTML dokumentu**
```html
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jednoduchý chat</title>
```
✔ **`<!DOCTYPE html>`** – Deklarace HTML5  
✔ **`<html lang="cs">`** – Určuje jazyk stránky (čeština)  
✔ **`<meta charset="UTF-8">`** – Používá Unicode kódování (podpora českých znaků)  
✔ **`<meta name="viewport" content="width=device-width, initial-scale=1.0">`** – Optimalizace pro mobilní zařízení  
✔ **`<title>Jednoduchý chat</title>`** – Název stránky  

💡 **Struktura dokumentu je správně nastavena pro širokou škálu zařízení.**

---

## **🎨 2️⃣ Stylování stránky (CSS)**
```css
body { font-family: Arial, sans-serif; max-width: 600px; margin: auto; }
form { margin-bottom: 20px; }
textarea { width: 100%; height: 50px; }
.message { border-bottom: 1px solid #ddd; padding: 5px 0; }
small { color: gray; font-size: 12px; }
```
✔ **Použití jednoduchého stylu pro přehlednost**  
✔ **Zprávy oddělené spodní hranicí (`border-bottom`)**  
✔ **Formulář a textarea na celou šířku (`width: 100%`)**  

💡 **Stránka je vizuálně jednoduchá a dobře čitelná.**

---

## **📜 3️⃣ Formulář pro odesílání zpráv**
```html
<form action="/send" method="post">
    <div>
        <label for="username">Vaše jméno:</label>
        <input type="text" name="username" placeholder="Vaše jméno" required>
    </div>
    <div>
        <label for="message">Zpráva:</label>
        <textarea name="message" placeholder="Napište zprávu..." required></textarea>
    </div>
    <div>
        <button type="submit">Odeslat</button>
    </div>
</form>
```
✔ **Používá HTTP metodu `POST` k odeslání dat na `/send`**  
✔ **`name="username"` a `name="message"`** – Inputy pro jméno a zprávu  
✔ **`required`** – Nutnost vyplnit před odesláním  

💡 **Po kliknutí na tlačítko "Odeslat" se data odešlou na server (`/send`).**

---

## **📄 4️⃣ Seznam zpráv + Vyhledávání**
```html
<h2>Seznam zpráv</h2>
<input type="text" id="search" placeholder="Hledat ve zprávách..." oninput="loadMessages()">
<div id="messages"></div>
```
✔ **Vyhledávací pole (`id="search"`) umožňuje hledání zpráv**  
✔ **Každá změna v poli (`oninput`) spustí funkci `loadMessages()`**  
✔ **Seznam zpráv (`id="messages"`) bude dynamicky plněn pomocí JavaScriptu**  

💡 **Díky tomu lze hledat zprávy bez nutnosti obnovit stránku.**

---

## **🚀 5️⃣ JavaScript – Načítání zpráv**
### **🟢 Asynchronní funkce `loadMessages()`**
```javascript
async function loadMessages() {
```
✔ **`async`** – Označuje funkci jako **asynchronní**, což znamená, že může používat `await` a vrací **Promise**.  
✔ **Promise** je objekt, který reprezentuje výsledek asynchronní operace (např. čekání na odpověď serveru).  

💡 **Asynchronní funkce umožňují pracovat s daty bez blokování hlavního vlákna programu.**

---

### **🔍 Fetch API – Získání zpráv ze serveru**
```javascript
const response = await fetch('/messages?search=' + encodeURIComponent(searchQuery));
```
✔ **`fetch()`** – Asynchronní metoda pro komunikaci se serverem  
✔ **`/messages?search=...`** – Serverový endpoint pro získání zpráv (s vyhledáváním)  
✔ **`encodeURIComponent(searchQuery)`** – Převádí vyhledávací řetězec na URL-safe formát (např. mezery → `%20`)  
✔ **`await`** – Zastaví vykonávání kódu, dokud server neposkytne odpověď  

💡 **Tento kód zajistí, že se ze serveru stáhnou zprávy odpovídající vyhledávání.**

---

### **📄 Převod odpovědi na JSON**
```javascript
const messages = await response.json();
```
✔ **`response.json()`** – Odpověď serveru (JSON) se převede na JavaScript pole objektů  
✔ **`await`** – Počká, dokud se odpověď nepřevede  

💡 **Po tomto řádku obsahuje proměnná `messages` seznam zpráv jako JavaScript objekty.**

---

### **🖥 Dynamické generování HTML pomocí `map()`**
```javascript
messagesDiv.innerHTML = messages.length 
    ? messages.map(msg =>
        `<div class="message">
            <strong>${msg.username}</strong>: ${msg.message} 
            <p><small>(${msg.timestamp})</small>, 
            <small>IP: ${msg.ip}</small></p>
        </div>`
    ).join('')
    : '<p>Žádné odpovídající zprávy.</p>';
```
✔ **`messages.map()`** – Projde každou zprávu a vytvoří HTML řetězec  
✔ **Ternární operátor (`? :`)** – Pokud existují zprávy, zobrazí je; jinak vypíše `"Žádné odpovídající zprávy."`  
✔ **`.join('')`** – Spojí všechny HTML řetězce do jednoho  

💡 **Díky `map()` se dynamicky generují HTML prvky pro každou zprávu.**

---

## **🔄 6️⃣ Automatická aktualizace zpráv**
```javascript
loadMessages();
setInterval(loadMessages, 5000);
```
✔ **`loadMessages();`** – Načte zprávy ihned po otevření stránky  
✔ **`setInterval(loadMessages, 5000);`** – Spustí `loadMessages()` každých **5 sekund**  

💡 **Tento kód umožňuje automatickou aktualizaci zpráv bez obnovování stránky.**

---

## **📌 Shrnutí funkcí souboru `index.html`**
| **Funkce** | **Co dělá?** |
|------------|-------------|
| **HTML formulář** | Umožňuje uživateli odeslat zprávu |
| **Vyhledávací pole** | Filtruje zprávy podle klíčového slova |
| **Načítání zpráv (`fetch`)** | Komunikuje se serverem pomocí Fetch API |
| **Asynchronní funkce (`async/await`)** | Umožňuje získat data bez blokování UI |
| **`map()`** | Dynamicky vytváří HTML kód pro zprávy |
| **`setInterval()`** | Automatická aktualizace chatu každých 5 sekund |

---

## **💡 Závěr**
✅ **Stránka umožňuje odesílání a zobrazování zpráv bez nutnosti obnovit stránku.**  
✅ **Použití `fetch()` a `async/await` umožňuje efektivní komunikaci se serverem.**  
✅ **Díky `map()` se HTML prvky generují dynamicky.**  
✅ **Automatická aktualizace chatu probíhá každých 5 sekund.**  

💡 **Tento přístup je ideální pro moderní webové aplikace – uživatelé vidí nové zprávy okamžitě a mohou je snadno vyhledávat! 🚀**

---

# **🔍 Podrobný rozbor modulu `jsonStorage.js`** <a id="json-storage"></a>
Soubor **`jsonStorage.js`** se stará o **ukládání a načítání zpráv do/z JSON souboru**. Je navržen jako **samostatný modul**, který může být znovu použit v různých částech aplikace.  

📌 **Obecné principy, které zde uvidíme:**  
✔ **Práce se soubory v Node.js** (`fs` modul)  
✔ **Čtení a zápis JSON**  
✔ **Ošetření výjimek (`try-catch`)**  
✔ **Modularizace kódu (export funkcí)**  

---

## **📂 1️⃣ Práce se soubory v Node.js**
Node.js poskytuje **nativní modul `fs`**, který umožňuje **číst, zapisovat a manipulovat soubory**.

📌 **Import modulu `fs` a nastavení cesty k souboru:**
```javascript
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'messages.json');
```
✔ **`fs` (File System)** – Základní modul pro práci se soubory.  
✔ **`path.join(__dirname, 'messages.json')`** – Zajistí správnou cestu k souboru, bez ohledu na operační systém.  

---

## **📖 2️⃣ Čtení dat ze souboru**
📌 **Funkce `getMessages()` načítá existující zprávy ze souboru `messages.json`.**
```javascript
function getMessages() {
    if (!fs.existsSync(filePath)) return [];  // Pokud soubor neexistuje, vrátíme prázdné pole.

    try {
        const data = fs.readFileSync(filePath, 'utf8');  // Čtení obsahu souboru
        return data ? JSON.parse(data) : [];  // Převod JSON řetězce na JavaScript pole
    } catch (error) {
        console.error("❌ Chyba při čtení messages.json:", error);
        return [];  // Pokud nastane chyba, vrátíme prázdné pole
    }
}
```

### **🔍 Co dělá tento kód?**
✔ **Kontroluje, zda soubor existuje** (`fs.existsSync`).  
✔ **Čte soubor synchronně** (`fs.readFileSync`).  
✔ **Převádí JSON řetězec na JavaScript pole (`JSON.parse()`)**.  
✔ **Ošetřuje chyby pomocí `try-catch`**.  

💡 **Ošetření chyb je důležité, protože pokud by soubor byl poškozený, aplikace by jinak spadla.**

---

## **✍ 3️⃣ Ukládání zpráv do souboru**
📌 **Funkce `addMessage()` přidává novou zprávu do `messages.json`.**
```javascript
function addMessage(username, message, ip) {
    const messages = getMessages();  // Načtení existujících zpráv
    const newMessage = {
        username,
        message,
        timestamp: new Date().toISOString(), // Přidání aktuálního času
        ip
    };

    messages.push(newMessage); // Přidání nové zprávy do pole

    try {
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
    } catch (error) {
        console.error("❌ Chyba při zápisu do messages.json:", error);
    }
}
```

### **🔍 Co dělá tento kód?**
✔ **Načte existující zprávy pomocí `getMessages()`**.  
✔ **Vytvoří nový objekt zprávy** (včetně timestamp a IP adresy).  
✔ **Přidá zprávu do pole a zapíše ho zpět do souboru (`fs.writeFileSync`)**.  
✔ **Používá `JSON.stringify(messages, null, 2)` pro pěkné formátování JSON souboru**.  
✔ **Ošetřuje chyby pomocí `try-catch`**, aby aplikace nespadla při problému se souborem.  

---

## **🛠 4️⃣ Ošetření výjimek (`try-catch`)**
🔹 **Když pracujeme se soubory, může se stát, že:**  
❌ **Soubor neexistuje** → `fs.readFileSync` vrátí chybu.  
❌ **Soubor je poškozený** → `JSON.parse(data)` selže.  
❌ **Zápis do souboru selže (např. nedostatečná oprávnění)**.  

📌 **Použití `try-catch` bloků zabraňuje pádu aplikace:**
```javascript
try {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
} catch (error) {
    console.error("❌ Chyba při zápisu do messages.json:", error);
}
```
💡 **Pokud dojde k chybě, vypíše se do konzole, ale aplikace pokračuje v běhu.**

---

## **📦 5️⃣ Modularizace kódu (Export a Import)**
🔹 **Node.js umožňuje rozdělit kód do samostatných modulů (`require()` a `module.exports`)**.  
🔹 **Díky tomu je `jsonStorage.js` přehledný a použitelný i v jiných aplikacích**.  

📌 **Export funkcí, aby je mohl použít `index.js`**:
```javascript
module.exports = { getMessages, addMessage };
```

📌 **Import v `index.js`:**
```javascript
const storage = require('./storage/jsonStorage');
```
💡 **Teď může `index.js` používat `storage.getMessages()` a `storage.addMessage()`.**

---

## **🔍 Shrnutí a obecné poznatky**
| **Téma** | **Použití v `jsonStorage.js`** |
|------------|--------------------------------|
| **Práce se soubory** | `fs.readFileSync()`, `fs.writeFileSync()` |
| **Čtení a zápis JSON** | `JSON.parse()`, `JSON.stringify()` |
| **Ošetření chyb** | `try-catch` při práci se soubory |
| **Použití modulů** | `module.exports`, `require()` |
| **Časová značka** | `new Date().toISOString()` pro ukládání času |

---

## **💡 Jak by mohl vypadat obecný modul pro práci se soubory?**
Pokud bychom chtěli vytvořit **obecný modul**, který by pracoval s jakýmkoli JSON souborem, mohl by vypadat takto:

📄 **Univerzální `fileStorage.js`**
```javascript
const fs = require('fs');

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Chyba při čtení souboru:", error);
        return [];
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("❌ Chyba při zápisu do souboru:", error);
    }
}

module.exports = { readJSON, writeJSON };
```

📌 **Použití pro ukládání zpráv v Messengeru:**
```javascript
const fileStorage = require('./fileStorage');
const filePath = 'messages.json';

let messages = fileStorage.readJSON(filePath);
messages.push({ username: "Student", message: "Ahoj!" });
fileStorage.writeJSON(filePath, messages);
```
💡 **Takový modul lze použít nejen pro zprávy, ale i pro jiná data!**

---

## **📌 Závěr**
✅ **`jsonStorage.js` používá soubor jako jednoduchou databázi**.  
✅ **Node.js modul `fs` umožňuje číst a zapisovat JSON soubory**.  
✅ **Ošetření výjimek `try-catch` zabraňuje pádům aplikace**.  
✅ **Díky modularizaci lze kód snadno použít i v jiných projektech**.  

💡 **Tento přístup je ideální pro malé aplikace – pokud však potřebujeme větší databázi, lepší je SQLite nebo MongoDB. 🚀**

---
# **📌 Podrobný rozbor modulu `sqliteStorage.js`** <a id="sqlite-storage"></a>

Soubor **`sqliteStorage.js`** se stará o **ukládání a načítání zpráv do databáze SQLite**. Tento přístup je **výhodnější než ukládání do souboru JSON**, protože umožňuje:  
✔ **Rychlé dotazování na data** 📊  
✔ **Filtrování a třídění zpráv** 📌  
✔ **Bezpečnější a škálovatelnější ukládání** 🔐  

📌 **Obecné principy, které zde uvidíme:**  
✔ **Práce s databázemi v Node.js** (`better-sqlite3` modul)  
✔ **Vytváření a správa tabulek SQL**  
✔ **CRUD operace (Create, Read, Update, Delete)**  
✔ **Ošetření výjimek při práci s databází**  
✔ **Modularizace kódu pro opětovné použití**  

---

## **📂 1️⃣ Práce s SQLite v Node.js**
SQLite je **lehká databáze, která běží v jednom souboru**. Pro její použití v Node.js se často využívá knihovna **`better-sqlite3`**, která umožňuje:  
✔ **Synchronní a efektivní práci s databází**  
✔ **Přímé SQL dotazy bez callbacků či proměnných typu Promise**  
✔ **Snadnou správu transakcí**  

📌 **Instalace `better-sqlite3`** (pokud není nainstalováno):  
```sh
npm install better-sqlite3
```

📌 **Import modulu a vytvoření připojení k databázi**
```javascript
const Database = require('better-sqlite3');
const db = new Database('messages.db', { verbose: console.log });
```
✔ **`new Database('messages.db')`** – Otevře nebo vytvoří soubor `messages.db`.  
✔ **`verbose: console.log`** – Vypisuje do konzole všechny SQL příkazy pro ladění.  

💡 **Databáze SQLite je tedy v jednom souboru `messages.db` – lze ji snadno přenášet!**

---

## **📖 2️⃣ Vytvoření tabulky v databázi**
📌 **Při spuštění se vytvoří tabulka `messages`, pokud ještě neexistuje.**  
```javascript
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip TEXT
    )
`);
```
🔹 **Co dělá tento SQL příkaz?**  
✔ **`id INTEGER PRIMARY KEY AUTOINCREMENT`** – Každá zpráva má unikátní číslo (ID).  
✔ **`username TEXT NOT NULL`** – Jméno odesílatele musí být vždy vyplněno.  
✔ **`message TEXT NOT NULL`** – Samotná zpráva (povinné).  
✔ **`timestamp DATETIME DEFAULT CURRENT_TIMESTAMP`** – Čas odeslání zprávy (automaticky).  
✔ **`ip TEXT`** – Ukládá IP adresu uživatele.  

💡 **Díky tomu máme strukturovaná data, která lze snadno třídit a filtrovat!**  

---

## **📜 3️⃣ Načítání zpráv z databáze**
📌 **Funkce `getMessages()` vrací všechny zprávy, seřazené od nejnovějších.**  
```javascript
function getMessages() {
    return db.prepare("SELECT * FROM messages ORDER BY timestamp DESC").all();
}
```
✔ **`SELECT * FROM messages`** – Získá všechny sloupce (`id, username, message, ...`).  
✔ **`ORDER BY timestamp DESC`** – Seřadí zprávy od nejnovějších.  
✔ **`.all()`** – Vrátí všechny výsledky jako pole objektů.  

💡 **Při načítání zpráv tedy máme hotové API, které stačí zavolat!**

---

## **✍ 4️⃣ Ukládání nové zprávy do SQLite**
📌 **Funkce `addMessage()` přidává zprávu do databáze.**  
```javascript
function addMessage(username, avatar, email, message, ip) {
    try {
        db.prepare(`
            INSERT INTO messages (username, avatar, email, message, timestamp, ip)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        `).run(username, message, ip);
        console.log("✅ Zpráva uložena do SQLite");
    } catch (error) {
        console.error("❌ Chyba při ukládání do SQLite:", error);
    }
}
```
✔ **`INSERT INTO messages (...) VALUES (...)`** – SQL dotaz pro přidání nové zprávy.  
✔ **`?` (placeholdery)** – Zabraňují SQL injection útokům.  
✔ **`CURRENT_TIMESTAMP`** – Automaticky nastaví čas odeslání.  
✔ **Ošetření chyb pomocí `try-catch`** – Pokud je problém, vypíše se do konzole.  

💡 **Každá zpráva se ihned uloží do databáze!**

---

## **🛠 5️⃣ Ošetření výjimek (`try-catch`)**
❌ **Možné chyby při práci s databází:**  
- **Soubor `messages.db` neexistuje nebo je poškozený**  
- **Tabulka `messages` neexistuje**  
- **SQL dotaz je nesprávně formulovaný**  

📌 **Proto kód obsahuje `try-catch`, aby aplikace nespadla:**
```javascript
try {
    db.prepare(...).run(...);
} catch (error) {
    console.error("❌ Chyba při ukládání do SQLite:", error);
}
```
💡 **Díky tomu aplikace zůstane funkční i při problémech!**

---

## **📦 6️⃣ Modularizace kódu (Export a Import)**
🔹 **Modulární přístup umožňuje snadné využití v `index.js`.**  

📌 **Export funkcí v `sqliteStorage.js`**
```javascript
module.exports = { getMessages, addMessage };
```
📌 **Import v `index.js`**
```javascript
const storage = require('./storage/sqliteStorage');
```
💡 **Díky tomu lze snadno přepínat mezi SQLite a JSON!**

---

## **🔍 Srovnání: SQLite vs. JSON**
| **Funkce** | **JSON (`jsonStorage.js`)** | **SQLite (`sqliteStorage.js`)** |
|------------|------------------|------------------|
| **Formát** | Soubor `messages.json` | Databázový soubor `messages.db` |
| **Rychlost** | Pomalejší pro velká data | Rychlejší díky indexům |
| **Filtrování a třídění** | Obtížné, nutno zpracovat v JS | SQL dotazy (snadné) |
| **Vhodné pro** | Malé aplikace, offline data | Střední a velké aplikace |

💡 **SQLite je výkonnější a vhodnější pro aplikace s více zprávami!** 🚀  

---

## **📌 Závěr**
✅ **SQLite umožňuje rychlé a strukturované ukládání dat**.  
✅ **Použití `better-sqlite3` usnadňuje práci bez callbacků**.  
✅ **Díky SQL dotazům můžeme snadno filtrovat a třídit zprávy**.  
✅ **Try-catch bloky zajišťují stabilitu aplikace**.  
✅ **Modularizace umožňuje snadné přepínání mezi SQLite a JSON**.  

💡 **Pokud chcete škálovat aplikaci, SQLite je skvělá volba – v budoucnu lze snadno přejít na větší databázi jako PostgreSQL nebo MongoDB. 🚀**

---
# **📌 Synchronní vs. Asynchronní programování na příkladu restaurace 🍽️)** <a id="sync-async"></a>

## **🔍 Co znamená synchronní a asynchronní programování?**
V programování existují **dva základní způsoby**, jak se kód vykonává:
1️⃣ **Synchronní** – Kód se vykonává **řádek po řádku**, vždy se čeká na dokončení jedné operace, než se začne provádět další.  
2️⃣ **Asynchronní** – Kód může spustit nějakou operaci (např. čekání na odpověď serveru) a pokračovat dál, aniž by čekal na výsledek.  

📌 **Nejlepší způsob, jak si to představit, je restaurace! 🍽️**  

---

## **👨‍🍳 Synchronní programování = Malá restaurace s jedním číšníkem**
### **Příklad: Obsluha zákazníků v synchronní restauraci**
1️⃣ Číšník přijde ke stolu a vezme objednávku.  
2️⃣ Odejde do kuchyně a čeká, dokud kuchař jídlo neuvaří.  
3️⃣ Jakmile dostane jídlo, přinese ho zákazníkovi.  
4️⃣ Teprve pak obslouží dalšího zákazníka.  

**⏳ Problém:**  
- Pokud kuchař vaří dlouho, zákazníci čekají.  
- Každý zákazník musí čekat na svého číšníka.  

📄 **V JavaScriptu by to vypadalo takto:**
```javascript
function objednatJidlo() {
    console.log("📝 Číšník bere objednávku.");
    cekani(5000); // Simulace čekání 5 sekund na jídlo
    console.log("🍽️ Číšník servíruje jídlo.");
}

objednatJidlo();
console.log("⏳ Další zákazník čeká...");
```
📌 **Výstup (vždy čekáme na dokončení předchozí operace)**  
```
📝 Číšník bere objednávku.
(čekání 5 sekund)
🍽️ Číšník servíruje jídlo.
⏳ Další zákazník čeká...
```
💡 **Nevýhoda synchronního přístupu:** Pokud kuchař vaří pomalu, celá restaurace stojí.

---

## **🍕 Asynchronní programování = Velká restaurace s více číšníky**
### **Příklad: Obsluha zákazníků v asynchronní restauraci**
1️⃣ Číšník přijde ke stolu a vezme objednávku.  
2️⃣ Pošle objednávku do kuchyně a **NEČEKÁ**, ale obslouží dalšího zákazníka.  
3️⃣ Jakmile kuchař dokončí jídlo, číšník ho přinese zákazníkovi.  

**🚀 Výhoda:**  
- Více zákazníků je obsluhováno zároveň.  
- Číšníci nečekají na kuchaře a věnují se dalším zákazníkům.  

📄 **V JavaScriptu by to vypadalo takto:**
```javascript
async function objednatJidlo() {
    console.log("📝 Číšník bere objednávku.");
    await cekani(5000); // Simulace čekání 5 sekund na jídlo
    console.log("🍽️ Číšník servíruje jídlo.");
}

objednatJidlo();
console.log("🛎️ Další zákazník může objednat!");
```
📌 **Výstup (číšník se věnuje dalším zákazníkům, zatímco kuchař vaří)**
```
📝 Číšník bere objednávku.
🛎️ Další zákazník může objednat!
(čekání 5 sekund)
🍽️ Číšník servíruje jídlo.
```
💡 **Výhoda asynchronního přístupu:** Restaurace funguje plynuleji – číšníci mohou obsluhovat další zákazníky, zatímco kuchaři vaří.

---

## **📌 Rozdíl mezi `setTimeout()`, `Promise` a `async/await` v JavaScriptu**
📌 **1️⃣ `setTimeout()` – Naplánování události na později**  
```javascript
console.log("📝 Číšník bere objednávku.");
setTimeout(() => {
    console.log("🍽️ Číšník servíruje jídlo.");
}, 5000);
console.log("🛎️ Další zákazník může objednat!");
```
**Výstup:**
```
📝 Číšník bere objednávku.
🛎️ Další zákazník může objednat!
(čekání 5 sekund)
🍽️ Číšník servíruje jídlo.
```
💡 **Toto je asynchronní operace – hlavní vlákno není blokováno!**

---

📌 **2️⃣ `Promise` – Řízení asynchronních operací pomocí objektu**
```javascript
function objednatJidlo() {
    return new Promise(resolve => {
        console.log("📝 Číšník bere objednávku.");
        setTimeout(() => {
            console.log("🍽️ Číšník servíruje jídlo.");
            resolve(); // Označí Promise jako splněný
        }, 5000);
    });
}

objednatJidlo().then(() => console.log("✅ Objednávka hotova!"));
console.log("🛎️ Další zákazník může objednat!");
```
**Výstup:**
```
📝 Číšník bere objednávku.
🛎️ Další zákazník může objednat!
(čekání 5 sekund)
🍽️ Číšník servíruje jídlo.
✅ Objednávka hotova!
```
💡 **`Promise` umožňuje sledovat stav asynchronní operace.**

---

📌 **3️⃣ `async/await` – Nejčistší způsob práce s asynchronním kódem**
```javascript
async function objednatJidlo() {
    console.log("📝 Číšník bere objednávku.");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Simulace čekání
    console.log("🍽️ Číšník servíruje jídlo.");
}

async function restaurace() {
    await objednatJidlo();
    console.log("✅ Objednávka hotova!");
}

restaurace();
console.log("🛎️ Další zákazník může objednat!");
```
**Výstup:**
```
📝 Číšník bere objednávku.
🛎️ Další zákazník může objednat!
(čekání 5 sekund)
🍽️ Číšník servíruje jídlo.
✅ Objednávka hotova!
```
💡 **Nejčistší způsob práce s asynchronním kódem – čitelnější než `Promise.then()`.**

---

## **📌 Shrnutí – Kdy použít synchronní a asynchronní přístup?**
| **Typ úlohy** | **Synchronní (blokující)** | **Asynchronní (neblokující)** |
|--------------|-----------------|------------------|
| **Jednoduché výpočty** | ✅ Ano | ❌ Ne |
| **Čekání na odpověď serveru** | ❌ Ne (zablokuje program) | ✅ Ano |
| **Zpracování souborů** | ❌ Ne | ✅ Ano |
| **Interakce s uživatelem** | ❌ Ne (zamrzne stránku) | ✅ Ano |

💡 **Ve webových aplikacích je asynchronní přístup naprosto klíčový – například pro načítání zpráv v chatu!** 🚀

---

## **💡 Závěr**
✅ **Synchronní kód běží postupně a může blokovat další operace (např. zamrzlá stránka).**  
✅ **Asynchronní kód umožňuje aplikaci dělat více věcí najednou (např. načítání dat ze serveru).**  
✅ **Fetch API, Promisy a `async/await` jsou základní nástroje pro asynchronní programování v JavaScriptu.**  
✅ **Použití asynchronního přístupu v chatu znamená, že uživatelé vidí nové zprávy bez nutnosti obnovovat stránku! 🚀**

---

# **📌 JSON – Co to je a jak ho využít?** <a id="json"></a>

📌 **JSON (JavaScript Object Notation)** je **lehce čitelný formát pro ukládání a výměnu dat**.  
Používá se ve webových aplikacích, databázích i API.  

📄 **Příklad souboru `messages.json`**:
```json
[
    {
        "username": "Petr",
        "message": "Ahoj, jak se máš?",
        "timestamp": "2024-03-04T12:00:00Z",
        "ip": "192.168.1.10"
    },
    {
        "username": "Anna",
        "message": "Jde to, co ty?",
        "timestamp": "2024-03-04T12:05:00Z",
        "ip": "192.168.1.12"
    }
]
```
✔ **Pole `[ ... ]` obsahuje jednotlivé zprávy jako objekty `{ ... }`.**  
✔ **Každá zpráva má vlastnosti (`username`, `message`, `timestamp`, `ip`).**  
✔ **Všechny hodnoty jsou buď řetězce (`"text"`), čísla (`123`), booleany (`true/false`), nebo jiná pole/objekty.**  

💡 **Formát JSON je velmi univerzální – lze ho snadno použít v různých programovacích jazycích.**

---

## **📂 Možnosti využití JSON**
📌 **Kde se JSON používá?**
| **Použití** | **Příklad** |
|------------|-------------|
| 🔄 **Ukládání dat** | Soubor `messages.json` v našem Messengeru |
| 🌐 **Komunikace s API** | Odpovědi ze serveru (`fetch('/messages')`) |
| 🛢 **NoSQL databáze** | MongoDB ukládá data v JSON podobě |
| 🏗 **Konfigurační soubory** | Nastavení v `package.json` |

💡 **JSON je standard pro výměnu dat mezi servery a klienty na webu.**  

---

## **📌 Práce s JSON v JavaScriptu**
📌 **1️⃣ Načtení JSON souboru v Node.js**
```javascript
const fs = require('fs');

const data = fs.readFileSync('messages.json', 'utf8'); // Načtení souboru
const messages = JSON.parse(data); // Převedení textu na objekt
console.log(messages);
```
✔ **`fs.readFileSync()`** – Načte soubor jako řetězec.  
✔ **`JSON.parse()`** – Převede řetězec na JavaScript pole objektů.  

💡 **Nyní máme data ve formátu, který lze snadno používat v aplikaci.**

---

📌 **2️⃣ Uložení nových dat do JSON souboru**
```javascript
const newMessage = {
    username: "Karel",
    message: "Super chat!",
    timestamp: new Date().toISOString(),
    ip: "192.168.1.20"
};

messages.push(newMessage); // Přidání nové zprávy
fs.writeFileSync('messages.json', JSON.stringify(messages, null, 2), 'utf8');
```
✔ **`messages.push(newMessage)`** – Přidání nové zprávy do pole.  
✔ **`JSON.stringify(messages, null, 2)`** – Převod objektu na čitelný JSON řetězec.  
✔ **`fs.writeFileSync()`** – Uloží data zpět do souboru.  

💡 **Takto náš server ukládá zprávy v Messengeru!**  

---

📌 **3️⃣ Odeslání JSON odpovědi v Express.js**
```javascript
app.get('/messages', (req, res) => {
    const messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
    res.json(messages);
});
```
✔ **Server vrátí zprávy jako JSON objekt**.  
✔ **Frontend je může získat pomocí `fetch()`**.  

💡 **Toto je základ REST API pro chatovací aplikaci!** 🚀

---

## **📄 Důležité funkce JSON v JavaScriptu**
| **Funkce** | **Co dělá?** | **Příklad** |
|------------|-------------|-------------|
| **`JSON.parse()`** | Převede JSON řetězec na objekt | `let data = JSON.parse(jsonText);` |
| **`JSON.stringify()`** | Převede objekt na JSON řetězec | `let text = JSON.stringify(data);` |
| **`fs.readFileSync()`** | Načte JSON soubor | `let raw = fs.readFileSync('data.json', 'utf8');` |
| **`fs.writeFileSync()`** | Zapíše JSON soubor | `fs.writeFileSync('data.json', JSON.stringify(obj));` |

💡 **Díky těmto funkcím můžeme snadno ukládat a načítat data v Messengeru.**  

---

## **🔍 Shrnutí**
✅ **JSON je jednoduchý formát pro ukládání a výměnu dat.**  
✅ **Používá se v API, databázích i konfiguračních souborech.**  
✅ **V JavaScriptu se JSON převádí pomocí `JSON.parse()` a `JSON.stringify()`.**  
✅ **Messenger ukládá zprávy do souboru `messages.json` a pracuje s nimi pomocí `fs` modulu.**  

💡 **JSON je dnes standardní způsob výměny dat na webu – a proto je důležité ho dobře znát! 🚀**

---
