const ReleaseBot = require('../.');

describe('ReleaseBot', () => {
    let release = [];
    let bot;

    beforeEach(() => {
        bot = new ReleaseBot('testToken');
        release = {
            name: { ru: 'test', en: 'test' },
            rating: {
                kinopoisk_score: 100,
                metacritic_score: 10,
                metacritic_user_score: 1,
            }
        }
    });

    describe('#_prepareMessage', () => {
        it('should prepare a markdown message', () => {
            const message = bot._prepareMessage([release]);
            expect(message).toBe([
                'Теперь *"test" (test)* доступен в качестве.',
                '    _Кинопоиск: 100_',
                '    _Метакритик: 10 | 1_',
            ].join('\n')); 
        });

        it('should prepare a markdown message for several releases', () => {
            const message = bot._prepareMessage([release, release]);
            expect(message).toBe([
                'Теперь *"test" (test)* доступен в качестве.',
                '    _Кинопоиск: 100_',
                '    _Метакритик: 10 | 1_',
                '',
                'А также:',
                '*"test" (test)*',
                '    _Кинопоиск: 100_',
                '    _Метакритик: 10 | 1_',
            ].join('\n')); 
        });

        it('should prepare a markdown message release without metacritic rating', () => {
            delete release.rating.metacritic_score;
            const message = bot._prepareMessage([release]);
            expect(message).toBe([
                'Теперь *"test" (test)* доступен в качестве.',
                '    _Кинопоиск: 100_',
            ].join('\n')); 
        });

        it('should prepare a markdown message release without kinopoisk rating', () => {
            delete release.rating.kinopoisk_score;
            const message = bot._prepareMessage([release]);
            expect(message).toBe([
                'Теперь *"test" (test)* доступен в качестве.',
                '    _Метакритик: 10 | 1_',
            ].join('\n')); 
        });

        it('should prepare a markdown message release without en name', () => {
            delete release.name.en;
            const message = bot._prepareMessage([release]);
            expect(message).toBe([
                'Теперь *"test"* доступен в качестве.',
                '    _Кинопоиск: 100_',
                '    _Метакритик: 10 | 1_',
            ].join('\n')); 
        });

        it('should prepare a markdown message release without ru name', () => {
            delete release.name.ru;
            const message = bot._prepareMessage([release]);
            expect(message).toBe([
                'Теперь *"test"* доступен в качестве.',
                '    _Кинопоиск: 100_',
                '    _Метакритик: 10 | 1_',
            ].join('\n')); 
        });

        it('should throw on no array provided', () => {
            expect(() => { bot._prepareMessage('test') })
                .toThrowError('releaseList should be an array'); 
        });
    });
});
