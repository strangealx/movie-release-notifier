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
     * @param {Array[Object]} releaseList list of releases to be notified
     * @returns {String} token value
     * @private
     */
    _prepareMessage(releaseList) {
        if (!releaseList || !(releaseList instanceof Array)) {
            throw new Error(
                'releaseList should be an array',
            );
        }
        const firstRelease = releaseList.splice(0,1);
        const message = Mustache.render(tmpl, {
            firstRelease,
            rest: releaseList,
        });
        return message.trim();
    }

    sendMessage(releaseList) {
        return super.sendMessage(telegramNotifyId, releaseList);
    }
}

module.exports = ReleaseBot;
