require('dotenv').config();

const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
} = process.env;

const config = {
    token: TELEGRAM_BOT_TOKEN || '',
    chatId: TELEGRAM_CHAT_ID || '',
    apiBaseUrl: 'https://api.telegram.org',
};

module.exports = config;
