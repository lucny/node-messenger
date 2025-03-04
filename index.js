/* Jednoduchý chat server s ukládáním zpráv v paměti */
// Import potřebných knihoven
// Express - serverový framework, který:
// - zjednodušuje vytváření HTTP serveru
// - poskytuje middleware pro zpracování HTTP požadavků
// - poskytuje možnost routování URL adres
const express = require('express');
// Body-parser - middleware pro zpracování formulářových dat
const bodyParser = require('body-parser');

// Express je funkce, která vytvoří novou instanci serveru
// app je objekt, který obsahuje metody pro konfiguraci serveru 
const app = express();
// Port, na kterém server bude poslouchat
const PORT = 3000;

// Pole pro ukládání zpráv v paměti
const messages = [];
// Vyber způsob ukládání zpráv (odkomentuj požadovaný řádek)
// const storage = require('./storage/jsonStorage'); // JSON soubor
const storage = require('./storage/sqliteStorage'); // SQLite databáze

/* Middleware - funkce, které zajišťují zpracování HTTP požadavků ještě před tím, než se dostanou k routám */
// Middleware pro zpracování formulářových dat ve formátu application/x-www-form-urlencoded
// Umožňuje získat data z formuláře v req.body - tělo HTTP požadavku
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware pro připojení statických souborů (HTML, CSS, JS) z adresáře public
app.use(express.static('public'));


/* Routování URL adres */ 
// Obsloužení hlavní stránky - routa '/'
// GET požadavek na URL '/'
app.get('/', (req, res) => {
    // Odeslání souboru index.html jako odpovědi serveru na požadavek klienta
    // __dirname - obsahuje cestu k adresáři, ve kterém je spuštěný skript
    res.sendFile(__dirname + '/public/index.html');
});

// Přijetí zprávy a její uložení do paměti
// POST požadavek na URL '/send'
app.post('/send', (req, res) => {
    // Získání dat z formuláře
    // req.body obsahuje data z formuláře, která byla odeslána metodou POST; vytvořené pomocí body-parseru
    // využití destrukturalizace objektu pro získání hodnot z objektu req.body
    const { username, message } = req.body;
    // Kontrola, zda byla vyplněna obě pole formuláře
    if (!username || !message) {
        // Odeslání chybové odpovědi s HTTP kódem 400 - chybný požadavek na straně klienta
        return res.status(400).send('Jméno a zpráva jsou povinné!');
    }

    // Získání IP adresy uživatele (zohledňuje proxy servery)
    const userIP = req.headers['x-forwarded-for'] || req.ip;
    
    // Získání User-Agent hlavičky (typ prohlížeče)
    const userAgent = req.get('User-Agent');

    // Uložení zprávy ve formě objektu do pole messages  
    // - objekt obsahuje jméno uživatele, zprávu, čas odeslání, IP adresu a User-Agent
    let msg = {
        username: username,
        message,
        timestamp: new Date().toISOString(),
        ip: userIP
    };
    messages.push(msg);
    /* Uložení zprávy do souboru nebo databáze podle zvoleného způsobu ukládání */
    storage.addMessage(msg.username, msg.message, msg.ip);

    // Přesměrování na hlavní stránku
    res.redirect('/');
});

// Routa pro získání všech zpráv
// GET požadavek na URL '/messages'
app.get('/messages', (req, res) => {
    // Získání hledaného řetězce z query parametru search
    // - req.query obsahuje query parametry z URL adresy
    // - jsou to parametry za otazníkem v URL adrese, např. ?search=ahoj
    // - získání hodnoty parametru search a převedení na malá písmena (metoda toLowerCase())
    // - pokud není parametr search zadán, použije se prázdný řetězec
    let messages = storage.getMessages();

    const search = req.query.search.toLowerCase() || "";

    // Filtrování zpráv podle hledaného řetězce
    // - messages.filter() vytvoří nové pole zpráv, které splňují podmínku
    // - msg je jedna zpráva z pole messages
    // - includes() zjistí, zda obsahuje řetězec search ve zprávě nebo jménu uživatele 
    const filteredMessages = messages.filter(msg =>
        msg.message.toLowerCase().includes(search) || 
        msg.username.toLowerCase().includes(search)
    );

    // Odeslání pole zpráv jako odpovědi serveru na požadavek klienta
    // - pole zpráv je převedeno na JSON formát
    res.json(filteredMessages);
});

// Spuštění serveru
app.listen(PORT, () => {
    // Vypsání informace o běžícím serveru do konzole
    console.log(`Server běží na http://localhost:${PORT}`);
});
