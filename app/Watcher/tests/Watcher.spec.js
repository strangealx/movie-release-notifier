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
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should create an instance', () => {
        expect(watcher.list).toBeInstanceOf(Object);
        expect(watcher.timeout).toBeInstanceOf(Object);
    });

    describe('#getReleaseTimeout()', () => {
        it('should return timeout until release date', () => {
            const timeout = watcher.getReleaseTimeLeft(release.timestamp);
            expect(timeout > 0).toBe(true);
        });

        it('should return 0 if release date less then now', () => {
            const timeout = watcher.getReleaseTimeLeft(new Date(Date.now() - 24 * 60 * 60 * 1e3));
            expect(timeout).toBe(0);
        });
    });

    describe('#createTimeout()', () => {
        it('should create new timeout', () => {
            const groupName = release.timestamp.getTime();
            watcher.addNewRelease(release);
            expect(watcher.timeout[groupName].id).toStrictEqual([release._id]);
            expect(watcher.timeout[groupName].timeoutId).toBeDefined();
            expect(setTimeout).toHaveBeenCalledTimes(1);
        });

        it('should not create new timeout on equal release timestamps', () => {
            const groupName = release.timestamp.getTime();
            watcher.addNewRelease(release);
            watcher.addNewRelease({ ...release, _id: release._id + 1 });
            expect(watcher.timeout[groupName].id).toStrictEqual(
                [release._id, release._id + 1],
            );
            expect(watcher.timeout[groupName].timeoutId).toBeDefined();
            expect(setTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe('#setReleaseTimeout()', () => {
        it('should return timeout id', () => {
            const groupName = release.timestamp.getTime() 
            const timeout = {
                [groupName]: {
                    timeoutId: undefined,
                    id: [release._id],
                }
            }
            const timeoutId = watcher.setReleaseTimeout(timeout, release.timestamp);
            expect(timeoutId > 0).toBe(true);
            expect(setTimeout).toHaveBeenCalledTimes(1);
        });

        it('should set several timeouts recursively on too big timeout', () => {
            release.timestamp = new Date(Date.now() + 2147483647 * 2);
            const groupName = release.timestamp.getTime();
            const timeout = {
                [groupName]: {
                    timeoutId: undefined,
                    id: [release._id],
                }
            }
            const timeoutId = watcher.setReleaseTimeout(timeout, release.timestamp);
            expect(timeoutId > 0).toBe(true);
            jest.runOnlyPendingTimers();
            expect(setTimeout).toHaveBeenCalledTimes(2);
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2147483647);
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
            expect(stringify(watcher.list[1])).toBe(stringify(release));
        });

        it('should add 2 releases in a row', () => {
            const { stringify } = JSON;
            const releaseNext = { ...release, _id: 2 };
            watcher.addNewRelease(release);
            watcher.addNewRelease(releaseNext);
            expect(stringify(watcher.list[1])).toBe(stringify(release));
            expect(stringify(watcher.list[2])).toBe(stringify(releaseNext));
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
            const releaseModified= merge({}, release, { _name: { ru: 'test1' } });
            watcher.modifyRelease(releaseModified);
            expect(stringify(watcher.list[1])).toBe(stringify(releaseModified));
        });

        it('should throw on modifying non existing release', () => {
            expect(() => {
                watcher.modifyRelease(release);
            }).toThrowError('expected release is not in stack');
        });
    });

    describe('#emitReleaseData()', () => {
        beforeEach(() => {
            release = {
                _id: 1,
                name: { ru: 'test', en: 'test' },
                timestamp: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            };
        });

        it('should emit "watcher:released" on release ready', (done) => {
            const { stringify } = JSON;
            watcher.removeRelease = jest.fn();
            watcher.addNewRelease(release);
            watcher.on('watcher:released', (data) => {
                expect(stringify(data)).toBe(stringify([release]));
                expect(watcher.removeRelease).toBeCalledWith(release);
                done();
            })
            jest.runAllTimers();
        });
    });
});
