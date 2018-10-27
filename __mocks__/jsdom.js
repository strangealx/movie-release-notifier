const data = {
    window: {
        document: 'jsdom success',
    },
};

const jsdom = {
    JSDOM: {
        fromURL: url => (
            new Promise((resolve, reject) => {
                setImmediate(
                    () => (url !== 'error'
                        ? resolve(data)
                        : reject(new Error('jsdom error'))),
                );
            })
        ),
    },
};

module.exports = jsdom;
