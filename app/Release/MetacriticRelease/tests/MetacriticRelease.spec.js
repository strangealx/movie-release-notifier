const MetacriticDigitalRelease = require('..');
const { metacriticDocument, randomDocument } = require('./test-data');

const { body } = document;

describe('KinopoiskDigitalRelease', () => {
    let release;
    const { stringify } = JSON;
    const enName = 'american dresser';

    beforeEach(() => {
        body.innerHTML = metacriticDocument;
        release = new MetacriticDigitalRelease(body);
    });

    describe('#name', () => {
        it('should parse release name from kinopoisk', () => {
            expect(stringify(release.name)).toBe(stringify({ name: { en: enName } }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.name)).toBe(stringify({ name: {} }));
        });
    });

    describe('#rating', () => {
        it('should parse release rating from kinopoisk', () => {
            expect(stringify(release.rating)).toBe(stringify({ rating: { metacritic_score: 24 } }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.rating)).toBe(stringify({ rating: {} }));
        });
    });

    describe('#date', () => {
        it('should parse release date from kinopoisk', () => {
            expect(stringify(release.date)).toBe(stringify({ timestamp: 1537462800000 }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.date)).toBe(stringify({ timestamp: 0 }));
        });
    });

    describe('#parsed', () => {
        it('should parse full release data from kinopoisk', () => {
            expect(stringify(release.parsed)).toBe(stringify({
                name: { en: enName },
                timestamp: 1537462800000,
                rating: { metacritic_score: 24 },
            }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.parsed)).toBe(stringify({
                name: {},
                timestamp: 0,
                rating: {},
            }));
        });
    });
});
