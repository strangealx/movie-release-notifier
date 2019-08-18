require('dotenv').config();

const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_NOTIFY_ID,
    TELEGRAM_DEBUG_ID,
} = process.env;

const config = {
    token: TELEGRAM_BOT_TOKEN || '',
    chatId: TELEGRAM_NOTIFY_ID || '',
    debugId: TELEGRAM_DEBUG_ID || '',
    apiBaseUrl: 'https://api.telegram.org',
};

module.exports = config;
