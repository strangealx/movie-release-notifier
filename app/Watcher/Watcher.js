const withEventEmitter = require('../../utils/with-event-emitter');
const { hours } = require('../../config/watcher/config');

// max possible timeout (2^31-1)
const MAX_TIMEOUT = 2147483647;

// TODO:
// use @withEventEmitter instead of function call
// only with babel, and we dont need babel for now

class Watcher {
    constructor() {
        this.list = {};
    }

    /**
     * adds new timeout for release event
     * @param {Object} release release data object
     * @param {Object} release.timestamp release date
     */
    addNewRelease(release) {
        if (this.list[release._id]) {
            throw new Error('release is already in stack');
        }
        this.list[release._id] = {
            data: release,
            timeout: this.setReleaseTimeout(release),
        };
    }

    /**
     * modifies exisitng timeout for release event
     * @param {Object} release release data object
     * @param {Object} release.timestamp release date
     */
    modifyRelease(release) {
        this.removeRelease(release);
        this.addNewRelease(release);
    }

    /**
     * removes exisitng timeout for release event
     * @param {Object} release release data object
     * @param {Object} release.timestamp release date
     */
    removeRelease(release) {
        if (!this.list[release._id]) {
            throw new Error('expected release is not in stack');
        }
        clearTimeout(this.list[release._id].timeout);
        this.list[release._id] = undefined;
    }

    /**
     * caclulates timeout until event emit
     * @param {Date} timestamp release date
     * @returns {Number} timeout until event emit
     * @private
     */
    getReleaseTimeout(timestamp) {
        const releaseTimestamp = timestamp.getTime() + hours;
        const timeout = releaseTimestamp - Date.now();
        return timeout > 0 ? timeout : 0;
    }

    /**
     * sets release timeout(s)
     * @param {Object} release release data object
     * @param {Object} release.timestamp release date
     * @returns {Number} timeout id
     * @private
     */
    setReleaseTimeout(release) {
        const timeout = this.getReleaseTimeout(release.timestamp);
        // node.js timeout has it's max value - 2147483647 (2^31-1)
        // so if timeout is less then this number
        // just call setTimeout
        if (timeout <= MAX_TIMEOUT) {
            return setTimeout(this.emitReleaseData.bind(this, release), timeout);
        }
        // else set timeout, that will set actual timeout
        // later recursively
        return setTimeout(() => {
            const localRelease = release;
            localRelease.timestamp = new Date(localRelease.timestamp.getTime() - MAX_TIMEOUT);
            this.list[localRelease._id].timeout = this.setReleaseTimeout(localRelease);
        }, MAX_TIMEOUT);
    }

    /**
     * emits event with release data
     * @param {Object} release.name release name object
     * @param {Number} release.timestamp release date
     * @param {String} [release.name.ru] ru release name
     * @param {String} [release.name.en] en release name
     * @param {Object} release.rating release rating object
     * @param {Number} [release.rating.kinopoisk_score] release rating from kinopoisk
     * @param {Number} [release.rating.metacritic_score] release rating from metacritic
     * @param {Number} [release.rating.metacritic_user_score] release user rating from metacritic
     * @emits movie:released release data object
     * @private
     */
    emitReleaseData(release) {
        this.removeRelease(release);
        this.emit('movie:released', release);
    }

    /**
     * fallback for no eventEmitter defined
     * @throws {Error}
     * @private
     */
    emit() {
        throw new Error('there must be EventEmitter decorator, but there is not');
    }
}

module.exports = withEventEmitter(Watcher);
