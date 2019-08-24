const winston = require('winston');
const Transport = require('winston-transport');
const DebugBot = require('../app/TelegramBot/DebugBot');

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
      // Perform the writing to the remote service
      callback();
    }
};

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
      new Telegram(),
    ]
});



if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

module.exports = logger;
