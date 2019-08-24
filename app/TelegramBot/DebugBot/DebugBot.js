const TelegramBot = require('../TelegramBot');
const {
    token: telegramToken,
    debugId: telegramNotifyId
} = require('../../../config/telegram/config');

class DebugBot extends TelegramBot {
    constructor() {
        super(telegramToken);
    }
    /**
     * prepares message to be sent
     * @param {Object} info log info
     * @returns {String} token value
     * @private
     */
    _prepareMessage(info) {
        const { message } = info;
        return message;
    }

    /**
     * makes api request
     * @param {Object} info log info
     * @returns {Promise<Object>} request response
     * @private
     */
    sendMessage(info) {
        return super.sendMessage(telegramNotifyId, info);
    }
}

module.exports = DebugBot;
