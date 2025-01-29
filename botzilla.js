const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(botToken, { polling: true });

// SENDING
function sendMessage(message) {
    bot.sendMessage(chatId, message);
}

// RECEIVING

module.exports = { sendMessage };