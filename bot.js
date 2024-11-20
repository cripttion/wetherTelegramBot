require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const db = new sqlite3.Database('./weather_bot.db');

// Initialize the database
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    chat_id INTEGER UNIQUE,
    blocked INTEGER DEFAULT 0
)`);

db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    value TEXT
)`);

// Ensure OpenWeather API key is present in settings
db.run(
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('openweather_api_key', ?)`,
    [process.env.OPENWEATHER_API_KEY]
);

// Start Bot
function startBot() {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const username = msg.from.username;

        db.get(`SELECT * FROM users WHERE chat_id = ?`, [chatId], (err, row) => {
            if (err) {
                bot.sendMessage(chatId, 'An error occurred while processing your request.');
                console.error(err);
                return;
            }

            if (row) {
                if (row.blocked) {
                    bot.sendMessage(chatId, 'You are blocked by the admin.');
                } else {
                    bot.sendMessage(chatId, 'You are already subscribed to weather updates.');
                }
            } else {
                db.run(
                    `INSERT INTO users (username, chat_id) VALUES (?, ?)`,
                    [username, chatId],
                    (err) => {
                        if (err) {
                            bot.sendMessage(chatId, 'Error subscribing to weather updates.');
                            console.error(err);
                        } else {
                            bot.sendMessage(
                                chatId,
                                'Welcome! Send the name of a city to receive weather updates.'
                            );
                        }
                    }
                );
            }
        });
    });

    // Handle city name input
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const cityName = msg.text.trim();

        // Ignore commands like /start
        if (cityName.startsWith('/')) return;

        db.get(`SELECT * FROM users WHERE chat_id = ?`, [chatId], (err, row) => {
            if (err) {
                bot.sendMessage(chatId, 'An error occurred while processing your request.');
                console.error(err);
                return;
            }

            if (row && row.blocked) {
                bot.sendMessage(chatId, 'You are blocked by the admin.');
                return;
            }

            db.get(`SELECT value FROM settings WHERE key = 'openweather_api_key'`, (err, settingsRow) => {
                if (err || !settingsRow) {
                    bot.sendMessage(chatId, 'Weather service is not configured. Please try again later.');
                    return;
                }

                const apiKey = settingsRow.value;
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                    cityName
                )}&appid=${apiKey}&units=metric`;

                axios
                    .get(url)
                    .then((response) => {
                        const weather = response.data;
                        const message = `Weather in ${weather.name}:\n` +
                                        `Temperature: ${weather.main.temp}°C\n` +
                                        `Description: ${weather.weather[0].description}`;
                        bot.sendMessage(chatId, message);
                    })
                    .catch((error) => {
                        if (error.response && error.response.status === 404) {
                            bot.sendMessage(chatId, 'City not found. Please check the city name and try again.');
                        } else {
                            bot.sendMessage(chatId, 'Error fetching weather details. Please try again later.');
                        }
                    });
            });
        });
    });
}

module.exports = { startBot };
