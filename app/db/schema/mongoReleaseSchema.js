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
            'en or ru must be provided',
        ],
    },
    rating: {
        kinopoisk_score: Number,
        metacritic_score: Number,
        metacritic_user_score: Number,
    },
    notified: { type: Boolean, default: false },
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
    const { name, timestamp } = this;
    const { stringify: str } = JSON;
    // simple validation
    if (!name || !timestamp) {
        return Promise.reject(
            new Error(`release item is invalid: name is ${str(name)}, timestamp is ${timestamp}`),
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
    return this.model('MongoRelease')
        .findOne(query)
        .sort({timestamp: -1})
        .then((doc) => {
            // save new if none is found and exit
            if (!doc) {
                return this.save()
                    .then(savedDoc => (
                        Promise.resolve({
                            type: 'saved',
                            release: savedDoc,
                        })
                    ));
            }
            const merged = mergeSimilarReleases(doc.toObject(), this.toObject());
            // nothing is new or modified
            if (doc.isTheSame(merged)) {
                return Promise.resolve({
                    type: 'skipped',
                    release: doc,
                });
            }
            // update db document
            doc.name = merged.name;
            doc.rating = merged.rating;
            doc.timestamp = merged.timestamp;
            return doc.save()
                .then((savedDoc) => (
                    Promise.resolve({
                        type: 'modified',
                        release: savedDoc,
                    })
                ))
        })
        .catch((e) => Promise.reject(e));
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
    const { rating, name, timestamp } = this.toObject();
    const { stringify } = JSON;
    // data objects should be sorted
    // in the same order, because we compare
    // them as strings
    const newData = {
        timestamp: doc.timestamp,
        name: doc.name,
        rating: doc.rating
    } = doc;
    const storedData = {
        timestamp: timestamp.getTime(),
        name,
        rating: rating || {},
    };
    // compares objects data as strings with
    // the most simple way to compare objects
    // but you should take care of objects structure
    return stringify(newData) === stringify(storedData);
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

/**
 * finds releases that are not released yet
 * and also client is not notified about
 * @mixin toBeNotified
 * @memberof mongoReleaseSchema
 * @return {Object[]} list of releases to notify client about
 */
mongoReleaseSchema.statics.toBeNotified = function toBeReleased() {
    const today = new Date().setHours(0, 0, 0, 0);
    return this
        .find({
            timestamp: { $gte: today },
            $or: [
                { notified: false },
                { notified: undefined },
            ]
        })
        .sort({ timestamp: 1 });
};

module.exports = mongoReleaseSchema;
