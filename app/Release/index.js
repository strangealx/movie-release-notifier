/**
 * Class representing a release model.
 */
class Release {
    /**
     * Constructor
     * @param {Node} release - node in the DOM tree.
     */
    constructor(release) {
        if (!release) return null;
        this.release = release;
        return this;
    }

    /**
     * combined release data object
     * @type {Object}
     */
    get parsed() {
        return {
            ...this.name,
            ...this.date,
            ...this.rating,
        };
    }

    /**
     * release name object
     * mock
     * @type {Object}
     */
    get name() {
        return {};
    }

    /**
     * release date timestamp
     * mock
     * @type {Object}
     */
    get date() {
        return Date.now();
    }

    /**
     * release rating score object
     * mock
     * @type {Object}
     */
    get rating() {
        return {};
    }
}

module.exports = Release;
