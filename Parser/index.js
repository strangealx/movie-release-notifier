const jsdom = require('jsdom');
const RSS = require('rss-parser');
const request = require('request');
const Iconv = require('iconv').Iconv;

const { JSDOM } = jsdom;
const rss = new RSS();

class Parser {

    constructor(options) {
        if (!options.name || !options.url) {
            console.error('no config passed to Parser class');
            return null;
        }
        this.options = { ...options };
    }

    get() {
        const url = this.options.url;
        if (url.match(/\.rss$/)) {
            return this.getRSS();
        }
        return this.getHTML();
    }

    getHTML() {
        const url = this.options.url;
        return JSDOM.fromURL(url)
            .then((dom) => {
                return new Promise((resolve) => {
                    const { document } = dom.window;
                    resolve(document);
                })
            })
    }

    getRSS() {
        const url = this.options.url;
        const encoding = this.options.encoding;
        return new Promise((resolve, reject) => {
            request({ 
                uri: url,
                method: 'GET',
                encoding: 'binary'
            }, function (error, response, body) {
                if (error) reject(error);
                body = new Buffer(body, 'binary');
                if (encoding) {
                    const conv = new Iconv(encoding, 'utf8');
                    body = conv.convert(body).toString();
                }
                resolve(rss.parseString(body));
            });
        })
    }

    parse() {}

}

module.exports = Parser;