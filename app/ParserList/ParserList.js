const withEventEmitter = require('../../utils/with-event-emitter');
const Parser = require('../Parser');
const mergeSimilarReleases = require('../../utils/merge-similar-releases');

// TODO:
// use @withEventEmitter instead of function call
// only with babel, and we dont need babel for now

/**
 * ParserList defaults
 * @type {Object}
 * @memberof ParserList
 */
const defaults = {
    /**
     * parse interval as milliseconds (6 hours)
     * @type {Number}
     */
    interval: 6 * 60 * 60 * 1e3,
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
            ...defaults,
            ...options,
        };
        // parsers list
        this.parserList = [];
    }

    /**
     * calls runParsers method repeatedly
     * @return {Number} interval id
     */
    run() {
        let { interval } = this;
        if (!interval) {
            this.runParsers();
            const period = this.options.interval;
            interval = setInterval(this.runParsers.bind(this), period);
            this.interval = interval;
        }
        return interval;
    }

    /**
     * removes parsing interval
     * @return {Boolean}
     */
    stop() {
        if (!this.interval) return false;
        clearInterval(this.interval);
        this.interval = null;
        return true;
    }

    /**
     * adds new parser instance to parsers list
     * @param {Parser} parser - parser instance to add into the list
     * @return {this}
     */
    addNewParser(parser) {
        if (!(parser instanceof Parser)) {
            console.error('Parser should be an instance of Parser');
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
        if (!parserList.length) {
            return Promise.reject(new Error('no parsers added'));
        }
        // it`s ok to handle requests with Promise.all while
        // there is a little amount of parsers
        const results = parserList.map(parser => parser.getList());
        return Promise.all(results)
            .then(releaseList => (
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

    /**
     * force parser list iteration
     * @emits parser.data event with release data
     * @emits parser.error event parser error
     * @return {this}
     */
    runParsers() {
        this.getUniqueList()
            .then(this.emit.bind(this, 'parser:data'))
            .catch(this.emit.bind(this, 'parser:error'));
        return this;
    }

    /**
     * fallback for no eventEmitter defined
     * @throws {Error}
     */
    emit() {
        throw new Error('there must be an EventEmitter decorator, but there is not');
    }
}

module.exports = withEventEmitter(ParserList);
