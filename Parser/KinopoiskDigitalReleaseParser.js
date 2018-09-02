const Parser = require('./index');

const config = {
    encoding: 'windows-1251',
    name: 'kinopoisk digital releases',
    url: 'https://www.kinopoisk.ru/comingsoon/digital/'
}

class KinopoiskDigitalReleaseParser extends Parser {

    constructor() {
        super({ ...config });
    }

    parse() {
        return this.get()
            .then((document) => {
                const _self = this;
                const release_html = document.querySelectorAll('.premier_item');
                return new Promise((resolve, reject) => {
                    if (!release_html) {
                        reject(new Error('no data found'));
                    }
                    const releases = Object.keys(release_html).map(index => {
                        const release = release_html[index];
                        return {
                            name: _self.parseName(release),
                            timestamp: _self.parseDate(release),
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
        let name_ru = release.querySelector('.name a');
        let name_en = name_ru.parentNode.nextSibling.nextSibling;
        name_ru = name_ru
            .textContent
            .toLowerCase();
        name_en = name_en
            .textContent
            .toLowerCase()
            .replace(/\s\(20[0-9]{2}\)/, '')
            .replace(/(.*),\s(the)$/, '$2 $1');
        return {
            en: name_en,
            ru: name_ru
        }
    }

    parseDate(release) {
        let date = release
            .querySelector('meta[itemProp="startDate"]')
            .getAttribute('content');
        return new Date(date).valueOf();
    }

    parseRating(release) {
        let rating = release.querySelector('.ajax_rating u').textContent;
        if (rating.match(/%/) || !parseFloat(rating)) {
            return undefined;
        }
        rating = parseFloat(rating);
        return { rating: { kinopoisk_score: rating } };
    }
}

module.exports = new KinopoiskDigitalReleaseParser();