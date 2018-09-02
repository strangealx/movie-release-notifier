const kinopoiskDigitalReleaseParser = require('./Parser/KinopoiskDigitalReleaseParser');

kinopoiskDigitalReleaseParser.parse()
    .then(console.log)
    .catch((e) => console.log(e.message));