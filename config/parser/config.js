const kinopoiskConfig = {
    encoding: 'windows-1251',
    name: 'kinopoisk digital releases',
    url: 'https://www.kinopoisk.ru/comingsoon/digital/',
    releaseSelector: '.premier_item',
};

const metacriticConfig = {
    name: 'metacritic releases',
    url: 'https://www.metacritic.com/browse/dvds/release-date/coming-soon/date',
    releaseSelector: '.clamp-list tr:not(.spacer)',
};

module.exports = {
    kinopoiskConfig,
    metacriticConfig,
};
