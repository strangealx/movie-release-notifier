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
            total: 0,
            saved: 0,
            modified: 0,
            skipped: 0,
        };
        releaseList.forEach((release, index) => {
            const dbRelease = new DBRelease(release);
            dbRelease.saveOrUpdate()
                .then((doc) => {
                    const { release, type } = doc;
                    const keys = Object.keys(counter);
                    counter[type] += 1;
                    counter.total += 1;
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
                    if (counter.total === releaseList.length) {
                        logger.info(
                            keys
                                .map(key => `${key}: ${counter[key]}`)
                                .join(', '),
                        );
                    }
                })
                .catch((err) => {
                    logger.error(err.message);
                });
        });
    })
    .on('parser:error', logger.error.bind(logger, 'HTTP: '));

watcher.on('watcher:released', (data) => {
    releaseBot.sendMessage(data.map(release => release.toObject()))
        .then(({ result }) => {
            data.map((release) => {
                release.notified = true;
                release.save()
                    .catch((err) => {
                        logger.error(err.message);
                    });
            });
            return Promise.resolve(result);
        })
        .catch((err) => {
            logger.error(err.message);
        });
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
