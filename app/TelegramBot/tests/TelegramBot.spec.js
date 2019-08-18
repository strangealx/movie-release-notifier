const TelegramBot = require('../.');
const { apiBaseUrl } = require('../../../config/telegram/config');

describe('TelegramBot', () => {
    let bot;

    beforeEach(() => {
        bot = new TelegramBot('testToken');
    });

    it('should create an instance', () => {
        expect(bot).toBeInstanceOf(TelegramBot);
        expect(bot.token).toBe('testToken');
    });

    describe('#url', () => {
        it('should return correct api request url', () => {
            const { url } = bot;
            expect(url).toBe(`${apiBaseUrl}/bottestToken`);
        });
    });

    describe('#token', () => {
        it('should set new api token', () => {
            bot.token = 'newTestToken';
            const { token } = bot;
            expect(token).toBe('newTestToken');
        });

        it('should trim new api token before set', () => {
            bot.token = 'newTestToken   ';
            const { token } = bot;
            expect(token).toBe('newTestToken');
        });

        it('should throw on invalid token set', () => {
            expect(() => {
                bot.token = 12;
            }).toThrowError(
                'No valid api token provided: 12',
            );
        });
    });

    describe('#_prepareMessage()', () => {
        it('should prepare provided message', () => {
            const message = 'newTestToken';
            const prepared = bot._prepareMessage(message);
            expect(prepared).toBe(message);
        });

        it('should throw on invalid message', () => {
            expect(() => {
                bot._prepareMessage(12)
            }).toThrowError(
                'No valid message provided: 12',
            );
        });
    });

    describe('#_request()', () => {
        it('should make a request', () => {
            const message = 'newTestMessage';
            expect.assertions(1);
            return expect(
                bot._request({
                    uri: '/',
                    form: { message },
                })
            ).resolves.toEqual('request success');
        });

        it('should reject on error', () => {
            const message = 'newTestMessage';
            expect.assertions(1);
            return expect(
                bot._request({
                    uri: 'error',
                    form: { message },
                })
            ).rejects.toEqual(new Error('request error'));
        });
    });

    describe('#sendMessage()', () => {
        it('should send message', () => {
            const message = 'newTestMessage';
            expect.assertions(1);
            return expect(
                bot.sendMessage('1', message)
            ).rejects.toEqual(new SyntaxError('Unexpected token r in JSON at position 0'));
        });

        it('should throw on invalid chat id provided message', () => {
            const message = 'newTestMessage';
            expect.assertions(1);
            return expect(
                bot.sendMessage(1, message)
            ).rejects.toEqual(new Error('Invalid chat id is proivied: 1'));
        });
    });
});
