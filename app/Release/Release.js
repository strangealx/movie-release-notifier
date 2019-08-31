/**
 * Class representing a release model.
 */
class Release {
    /**
     * Constructor
     * @param {Node} release - node in the DOM tree.
     */
    constructor(release) {
        if (!release) {
            throw new Error('no release data provided');
        }
        this.release = release;
        return this;
    }

    /**
     * combined release data object
     * @type {Object}
     */
    get parsed() {
        return {
            ...this.originalName,
            ...this.name,
            ...this.date,
            ...this.rating,
        };
    }

    /**
     * release original name object
     * mock
     * @type {Object}
     */
    get originalName() {
        return { originalName: {} };
    }

    /**
     * release name object
     * mock
     * @type {Object}
     */
    get name() {
        return { name: {} };
    }

    /**
     * release date timestamp
     * mock
     * @type {Object}
     */
    get date() {
        return { timestamp: 0 };
    }

    /**
     * release rating score object
     * mock
     * @type {Object}
     */
    get rating() {
        return { rating: {} };
    }
}

module.exports = Release;
