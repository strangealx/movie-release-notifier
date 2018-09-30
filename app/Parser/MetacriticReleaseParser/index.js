const Parser = require('../');

const config = {
    name: 'metacritic releases',
    url: 'https://www.metacritic.com/browse/dvds/release-date/coming-soon/date',
    releaseSelector: '.summary_row'
}

class MetacriticReleaseParser extends Parser {

    constructor() {
        super({ ...config });
    }

    parseName(release) {
        const name = release
            .querySelector('.title a')
            .textContent
            .toLowerCase();
        return {name: { en: name }};
    }

    parseDate(release) {
        const date = release
            .querySelector('.date_wrapper span')
            .textContent
            .toLowerCase();
        return { timestamp: new Date(date).valueOf() };
    }

    parseRating(release) {
        let rating = {};
        let metascritic_score = release
            .querySelector('.metascore_w')
            .textContent;
        let metacritic_user_score = release
            .nextSibling
            .nextSibling
            .querySelector('.userscore_text span:last-child');
        if (metacritic_user_score) {
            metacritic_user_score = metacritic_user_score.textContent;
        }
        metascritic_score = parseInt(metascritic_score);
        metacritic_user_score = parseFloat(metacritic_user_score);
        if (metascritic_score) {
            rating = { metascritic_score }
        }
        if (parseFloat(metacritic_user_score)) {
            rating = { ...rating, metacritic_user_score }
        } 
        if (!metascritic_score && !metacritic_user_score) {
            return null;
        }
        return { rating: { ...rating } };
    }
}

module.exports = new MetacriticReleaseParser();