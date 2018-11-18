const Parser = require('./Parser');
const DBRelease = require('./db/models/MongoReleaseModel');
const ParserList = require('./ParserList');
const KinopoiskDigitalRelease = require('./Release/KinopoiskDigitalRelease');
const MetacriticRelease = require('./Release/MetacriticRelease');
const { kinopoiskConfig, metacriticConfig } = require('../config/parser/config');
require('./db/connection');

const parserList = new ParserList();

DBRelease.toBeReleased()
    .then((saved) => {
        console.log(saved);
        parserList
            .addNewParser(new Parser(KinopoiskDigitalRelease, kinopoiskConfig))
            .addNewParser(new Parser(MetacriticRelease, metacriticConfig))
            .on('parser:data', (releaseList) => {
                let count = 0;
                releaseList.forEach((release) => {
                    const dbRelease = new DBRelease(release);
                    dbRelease.saveOrUpdate()
                        .then((doc) => {
                            const { data, type } = doc;
                            count += 1;
                            console.log(`${count}. ${type}: ${data.name.ru || data.name.en}`);
                        })
                        .catch(console.error.bind(console, 'saveOrUpdate error: '));
                });
            })
            .on('parser:error', console.error.bind(console, 'parser error: '))
            .run();
    })
    .catch(console.error.bind(console, 'db error: '));
