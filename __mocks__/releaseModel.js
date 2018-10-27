const ReleaseModel = require('../app/Release/index');

class TestReleaseModel extends ReleaseModel {
    constructor(release) {
        const instance = super(release);
        return instance;
    }

    get name() {
        return {
            en: 'test',
        };
    }

    get date() {
        return {
            timestamp: 1,
        };
    }

    get rating() {
        return {
            rating: {
                metacritic_score: 10,
            },
        };
    }
}

module.exports = TestReleaseModel;
