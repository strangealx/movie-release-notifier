const jsdom = require('jsdom');
const RSS = require('rss-parser');
const request = require('request');
const Iconv = require('iconv').Iconv;

const { JSDOM } = jsdom;
const rss = new RSS();

class Parser {

    constructor(options) {
        if (!options.name || !options.url) {
            console.error('no config passed to Parser instance');
            return null;
        }
        this.options = { ...options };
    }

    get dataType() {
        const { url } = this.options;
        if (url.match(/\.rss$/)) return 'rss';
        return 'html';
    }

    getList() {
        const _self = this;
        return _self.makeRequest()
            .then((document) => {
                switch (_self.dataType) {
                    case 'rss':
                        return new Promise((resolve, reject) => {
                            resolve(document)
                        });
                    default:
                        return _self.parse(document);
                }     
            });
    }

    makeRequest() {
        switch (this.dataType) {
            case 'rss': 
                return this.getRSS();
            default:
                return this.getHTML(); 
        }
    }

    parse(document) {
        const _self = this;
        const { releaseSelector } = _self.options;
        const release_html = document.querySelectorAll(releaseSelector);
        return new Promise((resolve, reject) => {
            if (!release_html) {
                reject(new Error('no data found'));
            }
            const releases = Object.keys(release_html).map(index => {
                const release = release_html[index];
                return {
                    ..._self.parseDate(release),
                    ..._self.parseName(release),
                    ..._self.parseRating(release)
                }
            });
            resolve(releases); 
        });   
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

    parseDate(release) {}
    parseName(release) {}
    parseRating(release) {}

}

module.exports = Parser;