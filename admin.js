const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const db = new sqlite3.Database('./weather_bot.db');

// Update API Key
router.post('/update-settings', (req, res) => {
    const { weatherApiKey, botApiKey } = req.body;

    // Update weather API key in the settings table
    if (weatherApiKey) {
        db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('openweather_api_key', ?)`, [weatherApiKey], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update weather API key' });
            }
        });
    }

    // Update bot API key in the settings table
    if (botApiKey) {
        db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('telegram_bot_api_key', ?)`, [botApiKey], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update bot API key' });
            }
        });
    }

    // Update the in-memory environment variables (if you need to use them directly in the app)
    if (weatherApiKey) {
        process.env.OPENWEATHER_API_KEY = weatherApiKey;
    }
    if (botApiKey) {
        process.env.TELEGRAM_BOT_TOKEN = botApiKey;
    }

    res.json({ message: 'API keys updated successfully' });
});
// Get Users
router.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
        if (err) res.status(500).json({ error: 'Failed to fetch users' });
        else res.json(rows);
    });
});

// Block User
router.post('/block-user', (req, res) => {
    const { chatId } = req.body;
    db.run(`UPDATE users SET blocked = 1 WHERE chat_id = ?`, [chatId], (err) => {
        if (err) res.status(500).json({ error: 'Failed to block user' });
        else res.json({ message: 'User blocked' });
    });
});

// Delete User
router.post('/delete-user', (req, res) => {
    const { chatId } = req.body;
    db.run(`DELETE FROM users WHERE chat_id = ?`, [chatId], (err) => {
        if (err) res.status(500).json({ error: 'Failed to delete user' });
        else res.json({ message: 'User deleted' });
    });
});

router.post('/unblock-user', (req, res) => {
    const { chatId } = req.body;
    db.run(`UPDATE users SET blocked = 0 WHERE chat_id = ?`, [chatId], (err) => {
        if (err) res.status(500).json({ error: 'Failed to unblock user' });
        else res.json({ message: 'User unblocked' });
    });
});
module.exports = router;
