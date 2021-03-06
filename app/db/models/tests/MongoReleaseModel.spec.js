const mongoose = require('mongoose');
const mongoReleaseSchema = require('../../schema/mongoReleaseSchema');
const {
    username,
    password,
    name,
    host,
    port,
    authDbName,
} = require('./config');

const MongoRelease = mongoose.model('MongoRelease', mongoReleaseSchema);

describe('MongoReleaseModel', () => {
    let release;
    let data;

    beforeAll(() => {
        mongoose.connect(`mongodb://${host}:${port}/${name}`, {
            user: username,
            pass: password,
            useNewUrlParser: true,
            auth: { authSource: authDbName },
        });
    });

    beforeEach(() => {
        data = {
            name: { en: 'test' },
            originalName: { en: 'Test' },
            rating: { metacritic_score: 1 },
            timestamp: Date.now(),
        };
        release = new MongoRelease(data);
        return release.save();
    });

    afterEach(() => (
        MongoRelease.remove({})
    ));

    afterAll(() => (
        mongoose.disconnect()
    ));

    describe('#toBeReleased()', () => {
        it('should return one release as to be released', () => (
            MongoRelease.toBeReleased()
                .then((releases) => {
                    expect(releases.length).toBe(1);
                })
        ));

        it('should not return releases with not actual date', () => {
            const next = { ...data };
            next.name = { ru: 'test 2' };
            next.timestamp = Date.now() - 60 * 60 * 24 * 1000;
            const nextRelease = new MongoRelease(next);
            return nextRelease.saveOrUpdate()
                .then(() => (
                    MongoRelease.toBeReleased()
                ))
                .then((releases) => {
                    expect(releases.length).toBe(1);
                });
        });
    });

    describe('#isTheSame()', () => {
        it('should return true when releases match', () => {
            const result = release.isTheSame(data);
            expect(result).toBe(true);
        });

        it('should return true when releases match with a shuffled key order', () => {
            const shuffled = {};
            const keys = Object.keys(data);
            for (let i = keys.length - 1; i >= 0; i -= 1) {
                const key = keys[i];
                shuffled[key] = data[key];
            }
            const result = release.isTheSame(shuffled);
            expect(result).toBe(true);
        });

        it('should return false when releases dismatch', () => {
            data.timestamp += 1;
            const result = release.isTheSame(data);
            expect(result).toBe(false);
        });
    });

    describe('#saveOrUpdate', () => {
        it('should save object if none is found', () => {
            const next = { ...data };
            next.name = { en: 'test 2' };
            const nextRelease = new MongoRelease(next);
            return nextRelease.saveOrUpdate()
                .then((savedData) => {
                    expect(savedData.type).toBe('saved');
                });
        });

        it('should not save object if same is found', () => {
            const nextRelease = new MongoRelease(data);
            return nextRelease.saveOrUpdate()
                .then((savedData) => {
                    expect(savedData.type).toBe('skipped');
                });
        });

        it('should modify saved object with new data', () => {
            data.timestamp -= 1;
            const nextRelease = new MongoRelease(data);
            return nextRelease.saveOrUpdate()
                .then((savedData) => {
                    expect(savedData.type).toBe('modified');
                });
        });

        it('should not modify saved object if new object has later release date', () => {
            data.timestamp += 1;
            const nextRelease = new MongoRelease(data);
            return nextRelease.saveOrUpdate()
                .then((savedData) => {
                    expect(savedData.type).toBe('skipped');
                });
        });

        it('should throw error on saving empty data object', () => {
            const nextRelease = new MongoRelease({});
            return nextRelease.saveOrUpdate()
                .then((savedData) => {
                    expect(savedData.type).toBe('skipped');
                })
                .catch((e) => {
                    expect(e.message).toBe('release item is invalid: name is undefined, timestamp is undefined');
                });
        });

        it('should throw error on saving invalid data', () => {
            const nextRelease = new MongoRelease({ name: {}, timestamp: 1 });
            return nextRelease.saveOrUpdate()
                .then((savedData) => {
                    expect(savedData).toBeUndefined();
                })
                .catch((e) => {
                    expect(e.message.trim()).toBe('MongoRelease validation failed: name: en or ru must be provided');
                });
        });
    });
});
