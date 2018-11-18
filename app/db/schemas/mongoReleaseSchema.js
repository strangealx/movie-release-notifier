const mongoose = require('mongoose');
const mergeSimilarReleases = require('../../../utils/merge-similar-releases');

const { Schema } = mongoose;

/**
 * name schema for MongoRelease
 * @memberof MongoRelease
 */
const nameSchema = new Schema({
    ru: String,
    en: String,
}, { _id: false });

/**
 * Class representing a release db schema
 * @class MongoRelease
 * @mixes {mongoReleaseSchema.methods}
 */
const mongoReleaseSchema = new Schema({
    timestamp: {
        type: Date,
        required: true,
    },
    name: {
        type: nameSchema,
        required: true,
        validate: [
            v => !!(v.en || v.ru),
            'provided name is invalid',
        ],
    },
    rating: {
        kinopoisk_score: Number,
        metacritic_score: Number,
        metacritic_user_score: Number,
    },
}, {
    collection: 'release',
});

/**
 * finds and updates/inserts new release into db
 * @mixin saveOrUpdate
 * @memberof mongoReleaseSchema
 * @return {Promise.<Object>} saved/updated/canceled document
 */
mongoReleaseSchema.methods.saveOrUpdate = function saveOrUpdate() {
    // simple validation
    if (!this.name || !this.timestamp) {
        return Promise.reject(
            new Error('release item is invalid: no name or timestamp provided'),
        );
    }
    // find query
    const query = {
        $or: [
            { 'name.en': { $exists: true, $eq: this.name.en } },
            { 'name.ru': { $exists: true, $eq: this.name.ru } },
        ],
    };
    // try to find existing release
    return this.model('MongoRelease').findOne(query)
        .then((doc) => {
            // save new if none is found and exit
            if (!doc) {
                return this.save()
                    .then(savedDoc => (
                        Promise.resolve({
                            type: 'saved',
                            data: savedDoc,
                        })
                    ));
            }
            // found one
            const stored = doc.toObject();
            // new one
            const toBeStored = this.toObject();
            // merged found one and new one
            const merged = mergeSimilarReleases(stored, toBeStored);
            // nothing is new or modified
            if (doc.isTheSame(merged)) {
                return Promise.resolve({
                    type: 'canceled',
                    data: {
                        ...stored,
                        _id: doc._id,
                    },
                });
            }
            // update db document
            return this.model('MongoRelease').updateOne({ _id: doc._id }, { $set: merged })
                .then(() => (
                    Promise.resolve({
                        type: 'modified',
                        data: {
                            ...merged,
                            _id: doc._id,
                        },
                    })
                ));
        })
        .catch(console.error.bind(console, 'find error: '));
};

/**
 * compares db stored data with provided data
 * @mixin isTheSame
 * @memberof mongoReleaseSchema
 * @param {Object} doc data to be compared
 * @param {Number} doc.timestamp release date timestamp
 * @param {Object} doc.name release name object
 * @param {Object} doc.rating release rating score object
 * @return {Boolean}
 */
mongoReleaseSchema.methods.isTheSame = function isTheSame(doc) {
    const { rating, name, timestamp } = this;
    const { stringify } = JSON;
    // data objects should be sorted
    // in same order, because we compare
    // them as strings
    const compareData = {
        timestamp: doc.timestamp,
        name: doc.name,
        rating: doc.rating,
    };
    // compares objects data as strings
    // the most simple way to compare objects
    // but you should take care of objects structure
    return stringify(compareData) === stringify({ timestamp: timestamp.getTime(), name, rating });
};

/**
 * finds releases that are not released yet
 * @mixin toBeReleased
 * @memberof mongoReleaseSchema
 * @return {Object[]} list of ready to be released documents
 */
mongoReleaseSchema.statics.toBeReleased = function toBeReleased() {
    const today = new Date().setHours(0, 0, 0, 0);
    return this
        .find({ timestamp: { $gte: today } })
        .sort({ timestamp: 1 });
};

module.exports = mongoReleaseSchema;
