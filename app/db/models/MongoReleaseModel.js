const mongoose = require('mongoose');
const mongoReleaseSchema = require('../schemas/mongoReleaseSchema');

const MongoRelease = mongoose.model('MongoRelease', mongoReleaseSchema);

module.exports = MongoRelease;
