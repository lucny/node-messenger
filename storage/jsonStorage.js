/* Modul pro práci se souborem messages.json, který obsahuje zprávy z formuláře. */
const fs = require('fs');
/* Modul path poskytuje funkce pro práci s cestami k souborům a adresářům */
const path = require('path');
/* Cesta k souboru messages.json */
const filePath = path.join(__dirname, 'messages.json');

/* Funkce pro načtení zpráv ze souboru */
function getMessages() {
    /* Pokud soubor neexistuje, vrátí prázdné pole */
    if (!fs.existsSync(filePath)) return [];
    /* Přečte obsah souboru a vrátí pole zpráv nebo prázdné pole */
    try {
        /* Přečte obsah souboru a vrátí pole zpráv nebo prázdné pole, pokud soubor neobsahuje data */
        const data = fs.readFileSync(filePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        /* Vypsání chyby do konzole, když dojde k chybě při čtení souboru */
        console.error("❌ Chyba při čtení messages.json:", error);
        return [];
    }
}

/* Funkce pro uložení zprávy do souboru */
function addMessage(username, message, ip) {
    /* Načte zprávy ze souboru */
    const messages = getMessages();
    /* Vytvoří novou zprávu a přidá ji do pole zpráv */
    const newMessage = { username, message, timestamp: new Date().toISOString(), ip };
    messages.push(newMessage);
    /* Pokusí se zapsat pole zpráv zpět do souboru */
    try {
        /* Zapíše pole zpráv zpět do souboru, JSON.stringify(messages, null, 2) zformátuje JSON s odsazením 2 mezerami */
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
    } catch (error) {
        /* Vypsání chyby do konzole, když dojde k chybě při zápisu do souboru
        (např. kvůli nedostatečným právům nebo neexistujícímu adresáři) */
        console.error("❌ Chyba při zápisu do messages.json:", error);
    }
}

/* Exportování funkcí getMessages a addMessage */
module.exports = { getMessages, addMessage };
