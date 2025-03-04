/* Konstanta Database obsahuje třídu pro práci s SQLite databází */
const Database = require('better-sqlite3');
/* Vytvoření instance databáze s názvem messages.db a zapnutým verbose režimem, který vypisuje dotazy na konzoli */
const db = new Database('messages.db', { verbose: console.log });

/* Vytvoření tabulky pro zprávy (pokud neexistuje) */
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip TEXT
    )
`);

/* Funkce pro načtení zpráv */
function getMessages() {
    /* Metoda all() vrátí pole objektů s daty z databáze */
    return db.prepare("SELECT * FROM messages ORDER BY timestamp DESC").all();
}

/* Funkce pro uložení zprávy do SQLite */
function addMessage(username, message, ip) {
    /* try ... catch blok pro zachycení chyb při ukládání do SQLite */
    try {
        /* Metoda run() provede dotaz na databázi, který vloží novou zprávu 
        s parametry username, avatar, email, message, aktuálním časovým razítkem a IP adresou */
        db.prepare(`
            INSERT INTO messages (username, message, timestamp, ip)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        `).run(username, message, ip);
        console.log("Zpráva uložena do SQLite");
    } catch (error) {
        /* Vypsání chyby do konzole, když dojde k chybě při ukládání do SQLite */
        console.error("❌ Chyba při ukládání do SQLite:", error);
    }
}

/* Exportování funkcí getMessages a addMessage */
module.exports = { getMessages, addMessage };
