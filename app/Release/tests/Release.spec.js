const Release = require('../Release');

describe('Release', () => {
    const { stringify } = JSON;
    let release;

    beforeEach(() => {
        release = new Release('test');
    });

    it('should create an instance', () => {
        release = new Release('test');
        expect(release.release).toBe('test');
    });

    it('should throw on creating instance with no release data provided', () => {
        expect(() => new Release()).toThrow();
    });

    describe('#name', () => {
        it('should return release name object', () => {
            expect(stringify(release.name)).toBe(stringify({ name: {} }));
        });
    });

    describe('#date', () => {
        it('should return release date object', () => {
            expect(stringify(release.date)).toBe(stringify({ timestamp: 0 }));
        });
    });

    describe('#rating', () => {
        it('should return release rating object', () => {
            expect(stringify(release.rating)).toBe(stringify({ rating: {} }));
        });
    });

    describe('#parsed', () => {
        it('should return release packed data', () => {
            expect(stringify(release.parsed)).toBe(stringify({
                name: {},
                timestamp: 0,
                rating: {},
            }));
        });
    });
});
