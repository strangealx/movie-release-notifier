const Parser = require('../index');

const config = {
    encoding: 'windows-1251',
    name: 'kinopoisk digital releases',
    url: 'https://www.kinopoisk.ru/comingsoon/digital/',
    releaseSelector: '.premier_item'
}

class KinopoiskDigitalReleaseParser extends Parser {

    constructor() {
        super({ ...config });
    }

    parseName(release) {
        const name = {};
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
        if (name_ru) name.ru = name_ru;
        if (name_en) name.en = name_en;
        return {name: { ...name }};
        
    }

    parseDate(release) {
        let date = release
            .querySelector('meta[itemProp="startDate"]')
            .getAttribute('content');
        return { timestamp: new Date(date).valueOf() };
    }

    parseRating(release) {
        let rating = release
            .querySelector('.ajax_rating u')
            .textContent;
        if (rating.match(/%/) || !parseFloat(rating)) {
            return undefined;
        }
        rating = parseFloat(rating);
        return { rating: { kinopoisk_score: rating } };
    } 
}

module.exports = new KinopoiskDigitalReleaseParser();