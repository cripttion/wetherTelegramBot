require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bot = require('./bot');
const admin = require('./admin');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin Panel Routes
app.use('/api', admin);

// Start the bot
bot.startBot();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
