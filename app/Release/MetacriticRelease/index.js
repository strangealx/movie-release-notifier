const Release = require('../');

/**
 * Class representing a release parsed from metacritic
 * www.metacritic.com/browse/dvds/release-date/coming-soon/date
 * @extends Release
 */
class MetacriticRelease extends Release {
    /**
     * Constructor
     * @param {Node} release - node in the DOM tree.
     */
    constructor(release) {
        const instance = super(release);
        return instance;
    }

    /**
     * release name object
     * @type {Object}
     */
    get name() {
        const { release } = this;
        const name = release
            .querySelector('.title a')
            .textContent
            .toLowerCase()
            .trim();
        return { name: { en: name } };
    }

    /**
     * release date object
     * @type {Object}
     */
    get date() {
        const { release } = this;
        const date = release
            .querySelector('.date_wrapper span')
            .textContent
            .toLowerCase();
        return { timestamp: new Date(date).valueOf() };
    }

    /**
     * release rating score object
     * @type {Object}
     */
    get rating() {
        const { release } = this;
        let rating = {};
        let metacriticScore = release
            .querySelector('.metascore_w')
            .textContent;
        let metacriticUserScore = release
            .nextSibling
            .nextSibling
            .querySelector('.userscore_text span:last-child');
        if (metacriticUserScore) {
            metacriticUserScore = metacriticUserScore.textContent;
        }
        // metacritic score is int
        metacriticScore = parseInt(metacriticScore, 10);
        // metacritic user score is float
        metacriticUserScore = parseFloat(metacriticUserScore);
        if (metacriticScore) {
            rating = { metacriticScore };
        }
        if (metacriticUserScore) {
            rating = { ...rating, metacriticUserScore };
        }
        if (!metacriticScore && !metacriticUserScore) {
            return null;
        }
        return { rating: { ...rating } };
    }
}

module.exports = MetacriticRelease;
