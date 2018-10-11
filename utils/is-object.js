/**
 * is provided item an object
 * @param {any} item expected object
 * @return {Boolean} provided item is an object
 */
const isObject = item => (
    item === Object(item) && !Array.isArray(item)
);

module.exports = isObject;
