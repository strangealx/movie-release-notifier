const Parser = require('./__mocks__/Parser').default;
const testData = require('./__mocks__/Parser').data;
const ParserList = require('../');

describe('ParserList', () => {
    let parserList;

    beforeEach(() => {
        console.error = jest.fn();
        parserList = new ParserList({
            interval: 1,
        });
    });

    it('should create an instance', () => {
        const { options } = parserList;
        expect(parserList instanceof ParserList).toBe(true);
        expect(parserList.parserList.length).toBe(0);
        expect(options.interval).toBe(1);
    });

    describe('#addNewParser()', () => {
        it('should add new parser to the list', () => {
            parserList.addNewParser(new Parser());
            expect(parserList.parserList.length).toBe(1);
        });

        it('should handle not Parser instance provided', () => {
            parserList.addNewParser('tet');
            parserList.addNewParser();
            expect(console.error).toHaveBeenCalled();
            expect(parserList.parserList.length).toBe(0);
        });
    });

    describe('#getList()', () => {
        beforeEach(() => {
            parserList.addNewParser(new Parser());
        });

        it('should call getList() method for each added parser', () => {
            parserList.addNewParser(new Parser());
            expect.assertions(1);
            return expect(parserList.getList()).resolves.toEqual([
                testData,
                testData,
                testData,
                testData,
            ]);
        });

        it('should throw error on parser error', () => {
            parserList.addNewParser(new Parser('error'));
            expect.assertions(1);
            return expect(parserList.getList()).rejects.toEqual(new Error('test error'));
        });
    });

    describe('#getUniqueList()', () => {
        beforeEach(() => {
            parserList.addNewParser(new Parser());
        });

        it('should process results and return list of unique releases', () => {
            parserList.addNewParser(new Parser());
            expect.assertions(1);
            return expect(parserList.getUniqueList()).resolves.toEqual([testData]);
        });

        it('should throw error on parser error', () => {
            parserList.addNewParser(new Parser('error'));
            expect.assertions(1);
            return expect(parserList.getUniqueList()).rejects.toEqual(new Error('test error'));
        });
    });
});
