import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(botToken, { polling: true });

// SENDING
export function sendMessage(msg) {
    bot.sendMessage(chatId, msg);
}

// LISTEN
export function listen() {
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const messageText = msg.text.toLowerCase();

        // Define keywords and corresponding actions
        if (messageText.includes('hello')) {
            bot.sendMessage(chatId, 'Hey boo!');
        } else {
            bot.sendMessage(chatId, "What's that?");
        }
    });
}