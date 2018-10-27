const Parser = require('../../../Parser');
const ReleaseModel = require('../../../Parser/tests/__mocks__/releaseModel');

const data = {
    name: {
        en: 'test',
    },
    rating: {
        metacritic_score: 10,
    },
    timestamp: 1,
};

class TestParser extends Parser {
    constructor(error = false) {
        super(ReleaseModel, {
            name: 'test',
            url: 'test',
        });
        if (error) this.error = error;
    }

    getList() {
        return new Promise((resolve, reject) => {
            if (this.error) {
                return reject(new Error('test error'));
            }
            return resolve([data, data]);
        });
    }
}

module.exports = {
    default: TestParser,
    data,
};
