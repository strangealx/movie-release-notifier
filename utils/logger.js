const winston = require('winston');
const Transport = require('winston-transport');
const DebugBot = require('../app/TelegramBot/DebugBot');
const { logPath } = require('../config/logs/config.js');

const path = path = String(logPath || '').trim().replace(/\/$/, '');

class Telegram extends Transport {
    constructor(opts) {
        super(opts);
        this.bot = new DebugBot();
    }
   
    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        const { bot } = this;
        bot.sendMessage(info);
        callback();
    }
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: `${path}/error.log`, level: 'error' }),
      new winston.transports.File({ filename: `${path}/combined.log` }),
      new Telegram(),
    ]
});



if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
