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

        it('should throw error on no parsers provided', () => {
            const emptyParserList = new ParserList();
            return expect(emptyParserList.getList()).rejects.toEqual(new Error('no parsers added'));
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

    describe('#run()', () => {
        it('should start interval execution', (done) => {
            let eventCounter = 0;
            expect(parserList.interval).toBeUndefined();
            parserList
                .addNewParser(new Parser())
                .on('parser:data', (data) => {
                    expect(data).toEqual([testData]);
                    eventCounter += 1;
                    if (eventCounter === 2) {
                        done();
                    }
                })
                .run();
            expect(parserList.interval).toBeDefined();
        });

        it('should not start interval execution if one is already started', (done) => {
            let eventCounter = 0;
            expect(parserList.interval).toBeUndefined();
            parserList
                .addNewParser(new Parser())
                .on('parser:data', (data) => {
                    expect(data).toEqual([testData]);
                    eventCounter += 1;
                    if (eventCounter === 2) {
                        done();
                    }
                })
                .run();
            const { interval } = parserList;
            expect(interval).toBeDefined();
            parserList.run();
            expect(parserList.interval).toBe(interval);
        });
    });

    describe('#stop()', () => {
        it('should do nothing if no interval is set', () => {
            expect(parserList.interval).toBeUndefined();
            expect(parserList.stop()).toBe(false);
        });

        it('should not start interval execution if one is already started', () => {
            expect(parserList.interval).toBeUndefined();
            parserList
                .addNewParser(new Parser())
                .run();
            const { interval } = parserList;
            expect(interval).toBeDefined();
            expect(parserList.stop()).toBe(true);
            expect(parserList.interval).toBe(null);
        });
    });

    describe('#runParsers()', () => {
        it('should emit data event', (done) => {
            parserList
                .addNewParser(new Parser())
                .on('parser:data', (data) => {
                    expect(data).toEqual([testData]);
                    done();
                })
                .runParsers();
        });

        it('should emit error event', (done) => {
            parserList
                .addNewParser(new Parser('error'))
                .on('parser:error', (data) => {
                    expect(data).toEqual(new Error('test error'));
                    done();
                })
                .runParsers();
        });
    });

    describe('#on()', () => {
        it('should add event handler', () => {
            const handleEvent = jest.fn();
            parserList.on('parser:data', handleEvent);
            const listeners = parserList.eventEmitter.listeners('parser:data');
            expect(listeners.length).toBe(1);
        });
    });

    describe('#off()', () => {
        it('should remove event handler', () => {
            const handleEvent = jest.fn();
            parserList.on('parser:data', handleEvent);
            const listenersBefore = parserList.eventEmitter.listeners('parser:data');
            expect(listenersBefore.length).toBe(1);
            parserList.off('parser:data', handleEvent);
            const listenersAfter = parserList.eventEmitter.listeners('parser:data');
            expect(listenersAfter.length).toBe(0);
        });
    });
});
