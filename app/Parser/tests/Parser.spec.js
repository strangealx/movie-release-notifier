const Parser = require('../../Parser');
const TestRelease = require('./__mocks__/releaseModel');

describe('Parser', () => {
    let parser;

    beforeEach(() => {
        parser = new Parser(TestRelease, {
            name: 'test',
            url: '/releases',
            releaseSelector: '.item',
        });
    });

    it('should create an instance', () => {
        const { options, ReleaseModel } = parser;
        const { url, name, releaseSelector } = options;
        expect(parser instanceof Parser).toBe(true);
        expect(url).toBe('/releases');
        expect(name).toBe('test');
        expect(releaseSelector).toBe('.item');
        expect(new ReleaseModel({}) instanceof TestRelease).toBe(true);
    });

    it('should throw on invalid ReleaseModel or no provided', () => {
        expect(() => new Parser()).toThrow();
    });

    it('should throw on invalid ReleaseModel or no provided', () => {
        expect(() => new Parser(TestRelease, {})).toThrow();
    });

    describe('#dataType', () => {
        it('should return html data type', () => {
            expect(parser.dataType).toBe('html');
        });

        it('should return rss data type', () => {
            parser = new Parser(TestRelease, {
                name: 'test',
                url: '/releases.rss',
                releaseSelector: '.item',
            });
            expect(parser.dataType).toBe('rss');
        });
    });

    describe('#getHTML()', () => {
        it('should make request and handle jsdom object', () => {
            expect.assertions(1);
            return expect(parser.getHTML()).resolves.toEqual('jsdom success');
        });

        it('should make request and handle error', () => {
            parser = new Parser(TestRelease, {
                name: 'test',
                url: 'error',
                releaseSelector: '.item',
            });
            expect.assertions(1);
            return expect(parser.getHTML()).rejects.toEqual(new Error('jsdom error'));
        });
    });

    describe('#getRSS()', () => {
        it('should make request and handle rss object', () => {
            expect.assertions(1);
            return expect(parser.getRSS()).resolves.toEqual('request success');
        });

        it('should make request and handle rss object with right encoding', () => {
            parser = new Parser(TestRelease, {
                name: 'test',
                url: '/test',
                encoding: 'windows-1251',
                releaseSelector: '.item',
            });
            expect.assertions(1);
            return expect(parser.getRSS()).resolves.toEqual('request success encoding');
        });

        it('should make request and handle error', () => {
            parser = new Parser(TestRelease, {
                name: 'test',
                url: 'error',
                releaseSelector: '.item',
            });
            expect.assertions(1);
            return expect(parser.getRSS()).rejects.toEqual(new Error('request error'));
        });
    });

    describe('#makeRequest()', () => {
        it('should make request and handle jsdom object', () => {
            expect.assertions(1);
            return expect(parser.makeRequest()).resolves.toEqual('jsdom success');
        });

        it('should make request and handle rss object', () => {
            parser = new Parser(TestRelease, {
                name: 'test',
                url: '/test.rss',
                releaseSelector: '.item',
            });
            expect.assertions(1);
            return expect(parser.makeRequest()).resolves.toEqual('request success');
        });

        it('should make request and handle error correctly', () => {
            parser = new Parser(TestRelease, {
                name: 'test',
                url: 'error',
                releaseSelector: '.item',
            });
            expect.assertions(1);
            return expect(parser.makeRequest()).rejects.toEqual(new Error('jsdom error'));
        });
    });

    describe('#parse()', () => {
        let document;

        beforeEach(() => {
            document = {
                querySelectorAll: () => ['test', 'test'],
            };
        });

        it('should process document from jsdom to collection of release objects', () => {
            const result = {
                name: {
                    en: 'test',
                },
                rating: {
                    metacritic_score: 10,
                },
                timestamp: 1,
            };
            expect.assertions(1);
            return expect(parser.parse(document)).resolves.toEqual([
                result,
                result,
            ]);
        });

        it('should handle no data', () => {
            document = {
                querySelectorAll: () => null,
            };
            expect.assertions(1);
            return expect(parser.parse(document)).rejects.toEqual(new Error('no data found'));
        });
    });

    describe('#getList()', () => {
        it('should make correct request for releases data according to provided options', () => {
            expect.assertions(1);
            return expect(parser.getList()).rejects.toEqual(new Error('provided document is not a jsdom document'));
        });
    });
});
