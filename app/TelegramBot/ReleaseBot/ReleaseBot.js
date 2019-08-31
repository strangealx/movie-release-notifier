const fs = require("fs");
const TelegramBot = require('../TelegramBot');
const Mustache = require('mustache');
const {
    token: telegramToken,
    chatId: telegramNotifyId
} = require('../../../config/telegram/config');

const tmpl = fs.readFileSync(`${__dirname}/release.mustache`).toString();

class ReleaseBot extends TelegramBot {
    constructor() {
        super(telegramToken);
    }
    /**
     * prepares message to be sent
     * @param {Object[]} releaseList list of releases to be notified
     * @returns {String} token value
     * @private
     */
    _prepareMessage(releaseList) {
        if (!releaseList || !(releaseList instanceof Array)) {
            throw new Error(
                'releaseList should be an array',
            );
        }
        const preparedList = releaseList.map(
            (release, index) => ({
                ...release,
                order: index + 1,
            }),
        );
        const message = Mustache.render(tmpl, { preparedList });
        return message.trim();
    }

    /**
     * makes api request
     * @param {Object[]} message array of release objects
     * @returns {Promise<Object>} request response
     * @private
     */
    sendMessage(releaseList) {
        return super.sendMessage(telegramNotifyId, releaseList);
    }
}

module.exports = ReleaseBot;
