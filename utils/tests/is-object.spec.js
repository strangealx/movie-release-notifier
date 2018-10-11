const isObject = require('../is-object');

describe('utils', () => {
    describe('#isObject()', () => {
        it('should return true when provided value is an object', () => {
            expect(isObject({})).toBe(true);
            expect(isObject(it)).toBe(true);
        });
        it('should return false when provided value is not an object', () => {
            expect(isObject('test')).toBe(false);
            expect(isObject(1)).toBe(false);
            expect(isObject(false)).toBe(false);
            expect(isObject([])).toBe(false);
            expect(isObject(null)).toBe(false);
            expect(isObject(NaN)).toBe(false);
            expect(isObject(undefined)).toBe(false);
        });
    });
});
