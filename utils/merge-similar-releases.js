const { min } = Math;
const mergeDeep = require('./merge-deep');
const isObject = require('./is-object');

/**
 * merges provided releases
 * @param {Object} releases list of releases to be merged
 * @return {Object} merged release
 */
const mergeSimilarReleases = (...releases) => {
    // default output
    const output = {
        // max available integer to choose one
        // that less on next steps
        timestamp: Number.MAX_SAFE_INTEGER,
        name: {},
        rating: {},
    };
    return releases.reduce((prev, release) => {
        const result = prev;
        if (isObject(release)) {
            let { timestamp } = release;
            const { name, rating } = release;
            if (timestamp instanceof Date) {
                timestamp = +timestamp.getTime();
            }
            // choose the closest release date
            // from different sources
            if (!Number.isNaN(parseFloat(timestamp)) && Number.isFinite(timestamp)) {
                result.timestamp = min(result.timestamp, timestamp);
            }
            // merge names and ratings as the most fresh
            result.name = mergeDeep({}, result.name, name);
            result.rating = mergeDeep({}, result.rating, rating);
        }
        return result;
    }, output);
};

module.exports = mergeSimilarReleases;
