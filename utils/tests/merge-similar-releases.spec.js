const mergeSimilarReleases = require('../merge-similar-releases');

describe('utils', () => {
    describe('#mergeSimilarReleases()', () => {
        const { stringify } = JSON;
        const { min } = Math;
        const release1 = {
            name: {
                ru: 'тест 1',
            },
            rating: {
                kinopoisk_score: 7,
            },
            timestamp: Date.now(),
        };
        const release2 = {
            name: {
                ru: 'тест 1',
                en: 'test 1',
            },
            rating: {
                metacritic_score: 5,
                metacritic_user_score: 4,
            },
            timestamp: Date.now() - 10000,
        };
        const result = {
            timestamp: release2.timestamp,
            name: {
                ru: release1.name.ru,
                en: release2.name.en,
            },
            rating: {
                kinopoisk_score: release1.rating.kinopoisk_score,
                metacritic_score: release2.rating.metacritic_score,
                metacritic_user_score: release2.rating.metacritic_user_score,
            },
        };

        it('should correctly merge provided releases', () => {
            const merged = mergeSimilarReleases(release1, release2);
            expect(stringify(merged) === stringify(result)).toBe(true);
        });

        it('should merge an earlier timestamp', () => {
            const merged1 = mergeSimilarReleases(release1, release2);
            const merged2 = mergeSimilarReleases(release2, release1);
            expect(merged1.timestamp).toBe(min(release1.timestamp, release2.timestamp));
            expect(merged2.timestamp).toBe(min(release1.timestamp, release2.timestamp));
        });

        it('should return some defaults on invalid data', () => {
            const defaultResult = { timestamp: 9007199254740991, name: {}, rating: {} };
            const merged = mergeSimilarReleases(null, null);
            expect(stringify(merged) === stringify(defaultResult)).toBe(true);
        });

        it('should return handle invalid timestamp data type', () => {
            release1.timestamp = 'test';
            const merged = mergeSimilarReleases(release1, release2);
            expect(merged.timestamp).toBe(release2.timestamp);
        });
    });
});
