const mongoose = require('mongoose');
const mongoReleaseSchema = require('../schema/mongoReleaseSchema');

const MongoRelease = mongoose.model('MongoRelease', mongoReleaseSchema);

module.exports = MongoRelease;
