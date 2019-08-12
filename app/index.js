const Parser = require('./Parser');
const DBRelease = require('./db/models/MongoReleaseModel');
const ParserList = require('./ParserList');
const Watcher = require('./Watcher');
const KinopoiskDigitalRelease = require('./Release/KinopoiskDigitalRelease');
const MetacriticRelease = require('./Release/MetacriticRelease');
const TelegramBot = require('./TelegramBot');
const { kinopoiskConfig, metacriticConfig } = require('../config/parser/config');
const { token: telegramToken, chatId: telegramChatId } = require('../config/telegram/config');
const markdown = require('../utils/release-to-markdown');
require('./db/connection');

const parserList = new ParserList();
const watcher = new Watcher();
const telegramBot = new TelegramBot(telegramToken);

parserList
    .on('parser:data', (releaseList) => {
        let count = 0;
        releaseList.forEach((release) => {
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
                    count += 1;
                    console.log(`${count}. ${type}: ${data.name.ru || data.name.en}`);
                })
                .catch(console.error.bind(console, `save or update: ${JSON.stringify(release)} `));
        });
    })
    .on('parser:error', console.error.bind(console, 'HTTP: '));

watcher.on('movie:released', (data) => {
    // TODO: group releases to 1 message
    telegramBot.sendMessage(
        telegramChatId,
        markdown(data),
    );
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
