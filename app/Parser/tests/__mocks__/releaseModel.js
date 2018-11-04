const ReleaseModel = require('../../../Release');

class TestReleaseModel extends ReleaseModel {
    constructor(release) {
        const instance = super(release || 'test');
        return instance;
    }

    get name() {
        return {
            name: {
                en: 'test',
            },
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
