const Release = require('../Release');

/**
 * Class representing a release parsed from kinopoisk
 * www.kinopoisk.ru/comingsoon/digital/
 * @extends Release
 */
class KinopoiskDigitalRelease extends Release {
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
        const name = {};
        let nameRu = '';
        let nameEn = '';
        nameRu = release.querySelector('.name a');
        if (!nameRu) return super.name;
        nameEn = nameRu
            .parentNode
            .nextSibling
            .nextSibling;
        nameRu = nameRu
            .textContent
            .toLowerCase()
            .trim();
        nameEn = nameEn
            .textContent
            .toLowerCase()
            .replace(/\s\(20[0-9]{2}\)/, '')
            .replace(/(.*),\s(the)$/, '$2 $1')
            .trim();
        if (nameRu) name.ru = nameRu;
        if (nameEn) name.en = nameEn;
        return { name: { ...name } };
    }

    /**
     * release date object
     * @type {Object}
     */
    get date() {
        const { release } = this;
        let date = release.querySelector('meta[itemProp="startDate"]');
        if (!date) return super.date;
        date = date.getAttribute('content');
        return { timestamp: new Date(date).valueOf() };
    }

    /**
     * release rating score object
     * @type {Object}
     */
    get rating() {
        const { release } = this;
        let rating = release.querySelector('.ajax_rating u');
        if (!rating) return super.rating;
        rating = rating.textContent;
        // there is 2 kinds of rating in same node
        // if it contains "%" then it is an await raiting
        // else it is a kinopoisk score
        if (rating.match(/%/) || !parseFloat(rating)) {
            return super.rating;
        }
        rating = parseFloat(rating);
        return { rating: { kinopoisk_score: rating } };
    }
}

module.exports = KinopoiskDigitalRelease;
