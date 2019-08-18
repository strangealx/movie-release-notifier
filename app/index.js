const Parser = require('./Parser');
const DBRelease = require('./db/models/MongoReleaseModel');
const ParserList = require('./ParserList');
const Watcher = require('./Watcher');
const KinopoiskDigitalRelease = require('./Release/KinopoiskDigitalRelease');
const MetacriticRelease = require('./Release/MetacriticRelease');
const ReleaseBot = require('./TelegramBot/ReleaseBot/ReleaseBot');
const { kinopoiskConfig, metacriticConfig } = require('../config/parser/config');
require('./db/connection');

const parserList = new ParserList();
const watcher = new Watcher();
const releaseBot = new ReleaseBot();

parserList
    .on('parser:data', (releaseList) => {
        let counter = {
            saved: 0,
            modified: 0,
            canceled: 0,
        };
        releaseList.forEach((release, index) => {
            const dbRelease = new DBRelease(release);
            dbRelease.saveOrUpdate()
                .then((doc) => {
                    const { data, type } = doc;
                    switch (type) {
                        case 'modified':
                            watcher.modifyRelease(data);
                            break;
                        case 'saved':
                            watcher.addNewRelease(data);
                            break;
                        default:
                            break;
                    }
                    counter[type] += 1;
                    if (index === releaseList.length - 1) {
                        console.log(
                            Object.keys(counter)
                                .map(key => `${key}: ${counter[key]}`)
                                .join(', '),
                        );
                    }
                })
                .catch(console.error.bind(console, `save or update: ${JSON.stringify(release)} `));
        });
    })
    .on('parser:error', console.error.bind(console, 'HTTP: '));

watcher.on('watcher:released', (data) => {
    // TODO: group releases to 1 message
    releaseBot.sendMessage(data)
        .then(console.log);
});

DBRelease.toBeReleased()
    .then((saved) => {
        saved.forEach((release) => {
            watcher.addNewRelease(release);
        });
        parserList
            .addNewParser(new Parser(KinopoiskDigitalRelease, kinopoiskConfig))
            .addNewParser(new Parser(MetacriticRelease, metacriticConfig))
            .run();
    })
    .catch(console.error.bind(console, 'db: '));
