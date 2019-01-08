const Watcher = require('../Watcher');

jest.useFakeTimers();

describe('Release', () => {
    // const { stringify } = JSON;
    const release = {
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

        it('should return timeout id several times', (done) => {
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
});
