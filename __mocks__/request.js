const data = 'request success';

const request = (reuestObject, callback) => {
    if (reuestObject.uri === 'error') {
        callback(new Error('request error'), null, null);
        return;
    }
    callback(null, null, data);
};

module.exports = request;
