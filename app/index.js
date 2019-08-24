const Parser = require('./Parser');
const DBRelease = require('./db/models/MongoReleaseModel');
const ParserList = require('./ParserList');
const Watcher = require('./Watcher');
const KinopoiskDigitalRelease = require('./Release/KinopoiskDigitalRelease');
const MetacriticRelease = require('./Release/MetacriticRelease');
const ReleaseBot = require('./TelegramBot/ReleaseBot/ReleaseBot');
const { kinopoiskConfig, metacriticConfig } = require('../config/parser/config');
const logger = require('../utils/logger');
require('./db/connection');

const parserList = new ParserList();
const watcher = new Watcher();
const releaseBot = new ReleaseBot();

parserList
    .on('parser:data', (releaseList) => {
        let counter = {
            saved: 0,
            modified: 0,
            skipped: 0,
        };
        releaseList.forEach((release, index) => {
            const dbRelease = new DBRelease(release);
            dbRelease.saveOrUpdate()
                .then((doc) => {
                    const { release, type } = doc;
                    switch (type) {
                        case 'modified':
                            watcher.modifyRelease(release);
                            break;
                        case 'saved':
                            watcher.addNewRelease(release);
                            break;
                        default:
                            break;
                    }
                    counter[type] += 1;
                    if (index === releaseList.length - 1) {
                        logger.info(
                            Object.keys(counter)
                                .map(key => `${key}: ${counter[key]}`)
                                .join(', '),
                        );
                    }
                })
                .catch(logger.error);
        });
    })
    .on('parser:error', logger.error.bind(logger, 'HTTP: '));

watcher.on('watcher:released', (data) => {
    releaseBot.sendMessage(data)
        .then(({ message, result }) => {
            message.map((release) => {
                release.notified = true;
                release.save()
                    .catch(logger.error);
            });
            return Promise.resolve(result);
        })
        .catch(logger.error)
});

DBRelease.toBeNotified()
    .then((saved) => {
        saved.forEach((release) => {
            watcher.addNewRelease(release);
        });
        parserList
            .addNewParser(new Parser(KinopoiskDigitalRelease, kinopoiskConfig))
            .addNewParser(new Parser(MetacriticRelease, metacriticConfig))
            .run();
    })
    .catch(logger.error.bind(logger, 'db: '));
