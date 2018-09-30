const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const releaseSchema = new Schema({
    timestamp: Date,
    name: {
        ru: String,
        en: String
    },
    rating: {
        kinopoisk_score: Number,
        metascritic_score: Number,
        metascritic_user_score: Number
    }
}, {
    collection: 'release'
});

releaseSchema.methods.saveOrUpdate = function() {
    const _self = this;
    let query = {
        $or: [
            { 'name.en': this.name.en },
            { 'name.ru': this.name.ru }
        ]
    };
    return _self.model('Release').findOne(query)
        .then((doc) => {
            if (!doc) {
                return _self.save();
            }
            const { min } = Math;
            const timestamp = min(doc.timestamp.getTime(), _self.timestamp);
            const name = Object.assign(doc.name, _self.name);
            const rating = Object.assign(doc.rating, _self.rating);
            return _self.model('Release').updateOne(
                { '_id': doc._id }, 
                { $set: { timestamp, name, rating } }
            );
        })
        .catch(console.error.bind(console, 'find error: '))
}

module.exports = releaseSchema;