const mergeDeep = require('../merge-deep');

describe('utils', () => {
    describe('#mergeDeep()', () => {
        const { stringify } = JSON;
        const tests = [
            { first: 0 },
            { first: 1, second: 2 },
            { first: 1, second: { third: 3 } },
            { first: 1, second: { third: { fourth: 4 } } },
            { first: null, second: { third: { fourth: 4 }, fifth: { sixth: 6 } } },
        ];

        it('should make a deep copy of a provided object', () => {
            let copy;
            for (let i = 0; i < tests.length; i += 1) {
                copy = {};
                copy = mergeDeep(copy, tests[i]);
                expect(stringify(copy)).toBe(stringify(tests[i]));
                expect(copy !== tests[i]).toBe(true);
            }
        });

        it('should make a deep copy of a provided object with both objects not empty at the beginning', () => {
            const copy = [
                { first: null },
                { first: null, second: 2 },
                { first: null, second: { third: 3 } },
                { first: 1, second: null },
                { first: null, second: 0 },
            ];
            for (let i = 0; i < tests.length; i += 1) {
                copy[i] = mergeDeep(copy[i], tests[i]);
                expect(stringify(copy[i])).toBe(stringify(tests[i]));
                expect(copy[i] !== tests[i]).toBe(true);
            }
        });

        it('should return a provided object if others are not provided', () => {
            let copy;
            for (let i = 0; i < tests.length; i += 1) {
                copy = {};
                copy = mergeDeep(tests[i]);
                expect(stringify(copy) === stringify(tests[i])).toBe(true);
                expect(copy === tests[i]).toBe(true);
            }
        });

        it('should return a provided value if it is not an object', () => {
            const copy = mergeDeep(1, tests[0], tests[1]);
            expect(copy === 1).toBe(true);
        });
    });
});
