const isObject = require('./is-object');

/**
 * makes a deep merge of provided objects
 * @param {Object} target root object to merge others into
 * @param {Object} sources objects to be merged
 * @return {Object} merged object
 */
const mergeDeep = (target, ...sources) => {
    // there is nothing to merge
    // so exit and return already merged or initial object
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    // make merging recursion magic :)
    if (isObject(target) && isObject(source)) {
        const keys = Object.keys(source);
        for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                mergeDeep(target[key], source[key]);
            }
            if (source[key] || source[key] === 0) {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    // continue merging
    return mergeDeep(target, ...sources);
};

module.exports = mergeDeep;
