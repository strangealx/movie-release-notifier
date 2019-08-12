// TODO: add test and comments

const request = require('request');
const { apiBaseUrl } = require('../../config/telegram/config');

class TelegramBot {
    constructor(token) {
        this.token = token;
    }

    get url() {
        const { token } = this;
        return `${apiBaseUrl}/bot${token}`;
    }

    set token(value) {
        if (typeof value !== 'string') {
            throw new Error(`No valid api token provided: ${value}`);
        }
        this._token = value.trim();
    }

    get token() {
        return this._token;
    }

    _prepareMessage(message) {
        if (typeof message !== 'string') {
            throw new Error(`No valid message provided: ${message}`);
        }
        return message;
    }

    _request(options) {
        return new Promise((resolve, reject) => {
            request(options, (err, response, body) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(body);
            });
        });
    }

    sendMessage(chatId, message) {
        const { url } = this;
        const prepared = this._prepareMessage(message);
        return this._request({
            url: `${url}/sendMessage`,
            form: {
                chat_id: chatId,
                parse_mode: 'markdown',
                text: prepared,
            },
        })
            .then((data) => {
                const { parse } = JSON;
                console.log(parse(data));
            })
            .catch(console.error);
    }
}

module.exports = TelegramBot;
