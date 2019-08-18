// TODO: add test and comments

const request = require('request');
const { apiBaseUrl } = require('../../config/telegram/config');

class TelegramBot {
    /**
     * @param {String} token api token
     */
    constructor(token) {
        this.token = token;
    }

    /**
     * @returns {String} api request url
     */
    get url() {
        const { token } = this;
        return `${apiBaseUrl}/bot${token}`;
    }

    /**
     * saves token value 
     */
    set token(value) {
        if (typeof value !== 'string' || !value) {
            throw new Error(`No valid api token provided: ${value}`);
        }
        this._token = value.trim();
    }

    /**
     * @returns {String} token value
     */
    get token() {
        return this._token;
    }

    /**
     * prepares message to be sent
     * @param {String} message message to send
     * @returns {String} token value
     * @private
     */
    _prepareMessage(message) {
        if (typeof message !== 'string' || !message) {
            throw new Error(`No valid message provided: ${message}`);
        }
        return message.replace('&#09;', '');
    }

    /**
     * makes api request
     * @param {Object} options request options
     * @param {String} options.url request url
     * @param {Object} options.form request data
     * @returns {Promise<String>} request response
     * @private
     */
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

    /**
     * makes api request
     * @param {String} chatId telegram chat id to send message to
     * @param {String} message message to send
     * @returns {Promise<Object>} request response
     * @private
     */
    sendMessage(chatId, message) {
        if (typeof chatId !== 'string' || !chatId) {
            return Promise.reject(new Error(`Invalid chat id is proivied: ${chatId}`));
        }
        return new Promise((resolve, reject) => {
            const { url } = this;
            const prepared = this._prepareMessage(message);
            this._request({
                url: `${url}/sendMessage`,
                form: {
                    chat_id: chatId,
                    parse_mode: 'markdown',
                    text: prepared,
                },
            })
                .then((data) => {
                    const { parse } = JSON;
                    let parsed;
                    try {
                        parsed = parse(data);
                    } catch (e) {
                        return reject(e);
                    }
                    return resolve(parsed);
                })
                .catch((e) => reject(e));
        });
    }
}

module.exports = TelegramBot;
