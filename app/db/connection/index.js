const mongoose = require('mongoose');
const {
    username,
    password,
    name,
    host,
    port,
    authDbName,
} = require('../../../config/db/config');
const logger = require('../../../utils/logger');

const db = mongoose.connection;

db.on('error', logger.error.bind(logger, 'db connection error: '));
db.once('open', logger.info.bind(logger, 'db connected'));

mongoose.connect(`mongodb://${host}:${port}/${name}`, {
    user: username,
    pass: password,
    useNewUrlParser: true,
    auth: { authSource: authDbName },
});

module.exports = db;
