const Parser = require('../Parser');
const mergeSimilarReleases = require('../../utils/merge-similar-releases');

/**
 * ParserList defaults
 * @type {Object}
 * @memberof ParserList
 */
const config = {
    /**
     * parse interval as milliseconds (12 hours)
     * @type {Number}
     */
    interval: 12 * 60 * 60 * (10 ** 3),
};

/**
 * Class representing a list of several parsers
 * to handle`em together
 */
class ParserList {
    /**
     * Constructor
     * @param {Object} options class options
     * @param {Number} options.interval parse interval as milliseconds
     */
    constructor(options) {
        // merge defaults and provided params
        this.options = {
            ...config,
            ...options,
        };
        // parsers list
        this.parserList = [];
    }

    /**
     * adds new parser instance to parsers list
     * @param {Parser} parser - parser instance to add into the list
     * @return {this}
     */
    addNewParser(parser) {
        if (!(parser instanceof Parser)) {
            console.error('Parser should be an instace of Parser class');
            return this;
        }
        // add new parser to the list
        this.parserList.push(parser);
        return this;
    }

    /**
     * gets a list of upcoming releases from provided sources
     * @returns {Promise.<Object[]>} array of parsed results from different sources
     */
    getList() {
        const { parserList } = this;
        // it`s ok to handle requests with Promise.all while
        // there is a little amount parsers
        const results = parserList.map(parser => parser.getList());
        return Promise.all(results).then(releaseList => (
            Promise.resolve(Array.prototype.concat(...releaseList))
        ));
    }

    /**
     * gets a list of upcoming releases from provided sources
     * and filters them by merging duplicates
     * @returns {Promise.<Object[]>} array of unique parsed results from different sources
     */
    getUniqueList() {
        return this.getList()
            .then(releaseList => (
                new Promise((resolve) => {
                    const uniqueList = releaseList
                        .reduce((prev, release) => {
                            const merged = prev;
                            const found = merged.findIndex((item) => {
                                const { name } = release;
                                const enNameExists = name && name.en && name.en === item.name.en;
                                const ruNameExists = name && name.ru && name.ru === item.name.ru;
                                return (enNameExists || ruNameExists);
                            });
                            if (found < 0) {
                                merged.push(release);
                            } else {
                                merged[found] = mergeSimilarReleases(merged[found], release);
                            }
                            return merged;
                        }, []);
                    resolve(uniqueList);
                })
            ));
    }
}

module.exports = ParserList;
