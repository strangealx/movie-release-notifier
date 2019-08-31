const KinopoiskDigitalRelease = require('../KinopoiskDigitalRelease');
const { kinopoiskDocument, randomDocument } = require('./test-data');

const { body } = document;

describe('KinopoiskDigitalRelease', () => {
    let release;
    const { stringify } = JSON;
    const ruName = '3 дня с роми шнайдер';
    const enName = '3 tage in quiberon';
    const ruOriginalName = '3 дня с Роми Шнайдер';
    const enOriginalName = '3 Tage in Quiberon';

    beforeEach(() => {
        body.innerHTML = kinopoiskDocument;
        release = new KinopoiskDigitalRelease(body);
    });

    describe('#name', () => {
        it('should parse release name from kinopoisk', () => {
            expect(stringify(release.name)).toBe(stringify({ name: { ru: ruName, en: enName } }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new KinopoiskDigitalRelease(body);
            expect(stringify(release.name)).toBe(stringify({ name: {} }));
        });
    });

    describe('#rating', () => {
        it('should parse release rating from kinopoisk', () => {
            expect(stringify(release.rating)).toBe(stringify({ rating: { kinopoisk_score: 6.9 } }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new KinopoiskDigitalRelease(body);
            expect(stringify(release.rating)).toBe(stringify({ rating: {} }));
        });
    });

    describe('#date', () => {
        it('should parse release date from kinopoisk', () => {
            expect(stringify(release.date)).toBe(stringify({ timestamp: 1540684800000 }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new KinopoiskDigitalRelease(body);
            expect(stringify(release.date)).toBe(stringify({ timestamp: 0 }));
        });
    });

    describe('#parsed', () => {
        it('should parse full release data from kinopoisk', () => {
            expect(stringify(release.parsed)).toBe(stringify({
                originalName: { ru: ruOriginalName, en: enOriginalName },
                name: { ru: ruName, en: enName },
                timestamp: 1540684800000,
                rating: { kinopoisk_score: 6.9 },
            }));
        });

        it('should handle unexpeted html', () => {
            body.innerHTML = randomDocument;
            release = new KinopoiskDigitalRelease(body);
            expect(stringify(release.parsed)).toBe(stringify({
                originalName: {},
                name: {},
                timestamp: 0,
                rating: {},
            }));
        });
    });
});
