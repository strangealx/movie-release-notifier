const Parser = require('./app/Parser');
const DBRelease = require('./app/db/models/MongoReleaseModel');
const ParserList = require('./app/ParserList');
const KinopoiskDigitalRelease = require('./app/Release/KinopoiskDigitalRelease');
const MetacriticRelease = require('./app/Release/MetacriticRelease');
const { kinopoiskConfig, metacriticConfig } = require('./config/parser/config');
require('./app/db/connection');

const parserList = new ParserList();

parserList
    .addNewParser(new Parser(KinopoiskDigitalRelease, kinopoiskConfig))
    .addNewParser(new Parser(MetacriticRelease, metacriticConfig));

parserList.getUniqueList()
    .then((releaseList) => {
        let count = 0;
        releaseList.forEach((release) => {
            const dbRelease = new DBRelease(release);
            dbRelease.saveOrUpdate()
                .then((doc) => {
                    count += 1;
                    if (doc.modified) {
                        console.log(`${count}. Modified: ${release.name.ru || release.name.en}`);
                        return;
                    }
                    if (doc.canceled) {
                        console.log(`${count}. Canceled: ${release.name.ru || release.name.en}`);
                        return;
                    }
                    console.log(`${count}. Saved: ${release.name.ru || release.name.en}`);
                })
                .catch(console.error.bind(console, 'saveOrUpdate error: '));
        });
    })
    .catch(console.error.bind(console, 'parse error: '));
