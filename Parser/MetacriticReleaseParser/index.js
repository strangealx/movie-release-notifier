const Parser = require('../');

const config = {
    name: 'metacritic releases',
    url: 'https://www.metacritic.com/browse/dvds/release-date/coming-soon/date'
}

class MetacriticReleaseParser extends Parser {

    constructor() {
        super({ ...config });
    }

    parse() {
        return this.get()
            .then((document) => {
                const _self = this;
                const release_html = document.querySelectorAll('.summary_row');
                return new Promise((resolve, reject) => {
                    if (!release_html) {
                        reject(new Error('no data found'));
                    }
                    const releases = Object.keys(release_html).map(index => {
                        const release = release_html[index];
                        return {
                            ..._self.parseDate(release),
                            ..._self.parseName(release),
                            ..._self.parseRating(release)
                        }
                    });
                    resolve(releases); 
                });
            })
            .catch((e) => {
                console.error('Parser error: ' + e.message)
            });
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