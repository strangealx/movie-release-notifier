const withEventEmitter = require('../../utils/with-event-emitter');
const { hours } = require('../../config/watcher/config');

// max possible timeout (2^31-1)
const MAX_TIMEOUT = 2147483647;

// TODO:
// ***
// use @withEventEmitter instead of function call
// only with babel, and we dont need babel for now
// ***
// add Joi release validation

class Watcher {
    constructor() {
        // release list
        this.list = {};
        // list of releases related by release date
        this.timeout = {};
    }

    /**
     * adds new timeout for release event
     * @param {Object} release release data object
     * @param {Date} release.timestamp release date
     * @param {String} release._id release id
     */
    addNewRelease(release) {
        const { list } = this;
        const { _id } = release;
        if (list[_id]) {
            throw new Error('release is already in stack');
        }
        list[_id] = release;
        // create timeout to emit the event
        this.createTimeout(release)
    }

    /**
     * modifies exisitng timeout for release event
     * @param {Object} release release data object
     * @param {Date} release.timestamp release date
     */
    modifyRelease(release) {
        // first remove
        this.removeRelease(release);
        // the re-add
        this.addNewRelease(release);
    }

    /**
     * removes existing release from release list
     * and from list of releases releated by date 
     * @param {Object} release release data object
     * @param {Date} release.timestamp release date
     * @param {String} release._id release id
     */
    removeRelease(release) {
        const { list, timeout } = this;
        const { _id } = release;
        if (!list[_id]) {
            throw new Error('expected release is not in stack');
        }
        const { timestamp } = list[_id];
        const groupName = timestamp.getTime();
        // find release list of releases related by date
        const index = timeout[groupName].id.indexOf(_id);
        // remove it from this list
        timeout[groupName].id.splice(index, 1);
        // also remove it from list of all releases
        delete list[_id];
        // clear timeout if there are no releases on same date
        if (!timeout[groupName].id.length) {
            clearTimeout(timeout[groupName].timeoutId);
            delete timeout[groupName];
        }
    }

    /**
     * caclulates timeout until event emit
     * @param {Date} timestamp release date
     * @returns {Number} timeout until event emit
     * @private
     */
    getReleaseTimeLeft(timestamp) {
        const releaseTimestamp = timestamp.getTime() + hours;
        const timeout = releaseTimestamp - Date.now();
        return timeout > 0 ? timeout : 0;
    }

    /**
     * creates new timeout
     * @param {Object} release release data object
     * @param {Date} release.timestamp release date
     * @param {String} release._id release id
     * @returns {Number} timeout id
     * @private
     */
    createTimeout(release) {
        const { timeout } = this;
        const { timestamp, _id } = release;
        const groupName = timestamp.getTime();
        timeout[groupName] = timeout[groupName] || {
            timeoutId: undefined,
            id: [],
        };
        const { timeoutId } = timeout[groupName];
        timeout[groupName].id.push(_id);
        timeout[groupName].timeoutId = timeoutId === undefined
            ? this.setReleaseTimeout(timeout[timestamp], timestamp)
            : timeoutId;
    }

    /**
     * sets release timeout(s)
     * @param {Object} timeout timeout object
     * @param {Number} timeout.timeoutId timeout id
     * @param {Array[String]} timeout.id list of related id's
     * @param {Date} timestamp timestamp to fire event     
     * @returns {Number} timeout id
     * @private
     */
    setReleaseTimeout(timeout, timestamp) {
        // node.js timeout has it's max value - 2147483647 (2^31-1)
        // so if timeout is less then this number
        // just call setTimeout
        const groupName = timestamp.getTime();
        const releaseLeft = this.getReleaseTimeLeft(timestamp);
        if (releaseLeft <= MAX_TIMEOUT) {
            return setTimeout(
                this.emitReleaseData.bind(this, groupName),
                releaseLeft,
            );
        }
        // else set timeout, that will set actual timeout later
        return setTimeout(() => {
            timeout[groupName].timeoutId = this.setReleaseTimeout(timeout, timestamp); 
        }, MAX_TIMEOUT);
    }

    /**
     * emits event with release data
     * @param {Numer} groupName name of releases group
     * @emits watcher:released array of release data object
     * @private
     */
    emitReleaseData(groupName) {
        const { timeout, list } = this;
        const { id: ids } = timeout[groupName] || { id: [] };
        const releases = ids.map(id => list[id]);
        releases.forEach(release => this.removeRelease(release));
        releases.length
            ? this.emit('watcher:released', releases)
            : {};
    }
}

module.exports = withEventEmitter(Watcher);
