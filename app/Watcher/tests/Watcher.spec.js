const merge = require('lodash.merge');
const Watcher = require('../Watcher');

jest.useFakeTimers();

describe('Release', () => {
    let release = {
        _id: 1,
        timestamp: new Date(Date.now() + 24 * 60 * 60 * 1e3),
    };
    let watcher;

    beforeEach(() => {
        watcher = new Watcher();
    });

    it('should create an instance', () => {
        expect(watcher.list).toBeInstanceOf(Object);
    });

    describe('#getReleaseTimeout()', () => {
        it('should return timeout until release date', () => {
            const timeout = watcher.getReleaseTimeout(release.timestamp);
            expect(timeout > 0).toBe(true);
        });

        it('should return 0 if release date less then now', () => {
            const timeout = watcher.getReleaseTimeout(new Date(Date.now() - 24 * 60 * 60 * 1e3));
            expect(timeout).toBe(0);
        });
    });

    describe('#setReleaseTimeout()', () => {
        it('should return timeout id', (done) => {
            const timeout = watcher.setReleaseTimeout(release);
            watcher.removeRelease = jest.fn();
            watcher.on('movie:released', (emitted) => {
                expect(emitted._id).toBe(release._id);
                expect(watcher.removeRelease).toBeCalled();
                done();
            });
            expect(timeout > 0).toBe(true);
            expect(setTimeout).toHaveBeenCalledTimes(1);
            jest.runAllTimers();
        });

        it('should set several timeouts recursively on too big timeout', (done) => {
            release.timestamp = new Date(Date.now() + 2147483647 * 2);
            const timeout = watcher.setReleaseTimeout(release);
            watcher.removeRelease = jest.fn();
            watcher.list[release._id] = {};
            watcher.on('movie:released', (emitted) => {
                expect(emitted._id).toBe(release._id);
                expect(setTimeout).toHaveBeenCalledTimes(4);
                expect(watcher.removeRelease).toBeCalled();
                done();
            });
            expect(timeout > 0).toBe(true);
            jest.runAllTimers();
        });
    });

    describe('#addNewRelease()', () => {
        beforeEach(() => {
            release = {
                _id: 1,
                name: { ru: 'test', en: 'test' },
                timestamp: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            };
        });

        it('should add new release to release list', () => {
            const { stringify } = JSON;
            watcher.addNewRelease(release);
            expect(stringify(watcher.list[1].data)).toBe(stringify(release));
        });

        it('should throw on adding already added release', () => {
            const { stringify } = JSON;
            const release2 = merge({}, release, { _id: 2 });
            watcher.addNewRelease(release);
            watcher.addNewRelease(release2);
            expect(stringify(watcher.list[1].data)).toBe(stringify(release));
            expect(stringify(watcher.list[2].data)).toBe(stringify(release2));
        });

        it('should throw on adding already added release', () => {
            watcher.addNewRelease(release);
            expect(() => {
                watcher.addNewRelease(release);
            }).toThrowError('release is already in stack');
        });
    });

    describe('#removeRelease()', () => {
        beforeEach(() => {
            release = {
                _id: 1,
                name: { ru: 'test', en: 'test' },
                timestamp: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            };
        });

        it('should remove release from release list', () => {
            const { stringify } = JSON;
            watcher.addNewRelease(release);
            watcher.removeRelease(release);
            expect(stringify(watcher.list)).toBe(stringify({}));
        });

        it('should throw on removing non existing release', () => {
            expect(() => {
                watcher.removeRelease(release);
            }).toThrowError('expected release is not in stack');
        });
    });

    describe('#modifyRelease()', () => {
        beforeEach(() => {
            release = {
                _id: 1,
                name: { ru: 'test', en: 'test' },
                timestamp: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            };
        });

        it('should modify release', () => {
            const { stringify } = JSON;
            watcher.addNewRelease(release);
            const release2 = merge({}, release, { _name: { ru: 'test1' } });
            watcher.modifyRelease(release2);
            expect(stringify(watcher.list[1].data)).toBe(stringify(release2));
        });

        it('should throw on modifying non existing release', () => {
            expect(() => {
                watcher.modifyRelease(release);
            }).toThrowError('expected release is not in stack');
        });
    });
});
