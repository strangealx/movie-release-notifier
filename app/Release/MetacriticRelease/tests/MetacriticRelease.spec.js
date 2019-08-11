const MetacriticDigitalRelease = require('..');
const { metacriticDocument, randomDocument } = require('./test-data');

const { body } = document;

describe('MetacriticDigitalRelease', () => {
    let release;
    const { stringify } = JSON;
    const enName = 'into the ashes';

    beforeEach(() => {
        body.innerHTML = metacriticDocument;
        release = new MetacriticDigitalRelease(body);
    });

    describe('#name', () => {
        it('should parse release name from metacritic', () => {
            expect(stringify(release.name)).toBe(stringify({ name: { en: enName } }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.name)).toBe(stringify({ name: {} }));
        });
    });

    describe('#rating', () => {
        it('should parse release rating from metacritic', () => {
            expect(stringify(release.rating)).toBe(stringify({ rating: { metacritic_score: 50 } }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.rating)).toBe(stringify({ rating: {} }));
        });
    });

    describe('#date', () => {
        it('should parse release date from metacritic', () => {
            expect(stringify(release.date)).toBe(stringify({ timestamp: 1567443600000 }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new MetacriticDigitalRelease(body);
            expect(stringify(release.date)).toBe(stringify({ timestamp: 0 }));
        });
    });

    describe('#parsed', () => {
        it('should parse full release data from metacritic', () => {
            expect(stringify(release.parsed)).toBe(stringify({
                name: { en: enName },
                timestamp: 1567443600000,
                rating: { metacritic_score: 50 },
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
