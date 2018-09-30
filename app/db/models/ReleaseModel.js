const mongoose = require('mongoose');
const releaseSchema = require('../schemas/releaseSchema');

const Release = mongoose.model('Release', releaseSchema);

module.exports = Release;