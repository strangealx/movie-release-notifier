const jsdom = require('jsdom');
const RSS = require('rss-parser');
const request = require('request');
const iconv = require('iconv');
const Release = require('../Release');

const { Iconv } = iconv;
const { JSDOM } = jsdom;

/**
 * Class representing a parser
 */
class Parser {
    /**
     * Constructor
     * @param {Release} ReleaseModel release model
     * @param {Object} options parser config
     * @param {String} options.url source url
     * @param {String} options.releaseSelector jQuery style release selector
     * @param {String} options.name parser name
     * @param {String} [options.encoding] source encoding
     */
    constructor(ReleaseModel, options) {
        if (!(new ReleaseModel() instanceof Release)) {
            throw new Error('ReleaseModel is not instance of Release class');
        }
        if (!options.name || !options.url) {
            throw new Error('no config passed to Parser instance');
        }
        this.ReleaseModel = ReleaseModel;
        this.options = { ...options };
    }

    /**
     * source type: rss or html by now
     */
    get dataType() {
        const { url } = this.options;
        if (url.match(/\.rss$/)) return 'rss';
        return 'html';
    }

    /**
     * makes request and gets a list of upcoming releases
     * @return {Promise.<Object[]>} array of parsed results from provided source
     */
    getList() {
        return this.makeRequest()
            .then((document) => {
                switch (this.dataType) {
                    case 'rss':
                        return Promise.resolve(document);
                    default:
                        return this.parse(document);
                }
            });
    }

    /**
     * makes request for upcoming releases data
     * @return {Promise.<Object>} JSDOM document object | parsed rss
     */
    makeRequest() {
        switch (this.dataType) {
            case 'rss':
                return this.getRSS();
            default:
                return this.getHTML();
        }
    }

    parse(document) {
        const { ReleaseModel } = this;
        const { releaseSelector } = this.options;
        if (!document.querySelectorAll || typeof document.querySelectorAll !== 'function') {
            return Promise.reject(new Error('provided document is not a jsdom document'));
        }
        const releaseHTML = document.querySelectorAll(releaseSelector);
        return new Promise((resolve, reject) => {
            if (!releaseHTML) {
                return reject(new Error('no data found'));
            }
            const releases = Object.keys(releaseHTML).map((index) => {
                const release = new ReleaseModel(releaseHTML[index]);
                return release.parsed;
            });
            return resolve(releases || []);
        });
    }

    getHTML() {
        const { url } = this.options;
        const { fromURL } = JSDOM;
        return fromURL(url)
            .then(dom => (
                new Promise((resolve) => {
                    const { document } = dom.window;
                    return resolve(document);
                })
            ));
    }

    getRSS() {
        const { url, encoding } = this.options;
        return new Promise((resolve, reject) => {
            request({
                uri: url,
                method: 'GET',
                encoding: 'binary',
            }, (error, response, body) => {
                if (error) {
                    return reject(error);
                }
                const rss = new RSS();
                let data = body;
                if (encoding) {
                    const conv = new Iconv(encoding, 'utf8');
                    data = Buffer.from(data);
                    data = conv.convert(body).toString();
                }
                return resolve(rss.parseString(data));
            });
        });
    }
}

module.exports = Parser;
