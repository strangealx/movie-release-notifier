const Release = require('../Release');

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
        let name = release.querySelector('a.title');
        if (!name) return super.name;
        name = name
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
        let date = release.querySelectorAll('.clamp-details span')[0];
        if (!date) return super.date;
        date = date
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
        const metacriticScore = release.querySelector('.metascore_w:not(.user)');
        const metacriticUserScore = release.querySelector('.metascore_w.user');
        if (!metacriticScore && !metacriticUserScore) return super.rating;
        if (metacriticScore) {
            let score = metacriticScore.textContent;
            // metacritic score is int
            score = parseInt(score, 10);
            if (score) {
                rating = { metacritic_score: score };
            }
        }
        if (metacriticUserScore) {
            let score = metacriticUserScore.textContent;
            // metacritic user score is float
            score = parseFloat(score);
            if (score) {
                rating = { ...rating, metacritic_user_score: score };
            }
        }
        return { rating: { ...rating } };
    }
}

module.exports = MetacriticRelease;
