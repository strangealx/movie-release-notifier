const kinopoiskDigitalReleaseParser = require('./Parser/KinopoiskDigitalReleaseParser');
const metacriticReleaseParser = require('./Parser/MetacriticReleaseParser');

kinopoiskDigitalReleaseParser.parse()
    .then(console.log)
    .catch((e) => console.log(e.message));

metacriticReleaseParser.parse()
    .then(console.log)
    .catch((e) => console.log(e.message));