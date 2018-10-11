const mongoose = require('mongoose');
const {
    username,
    password,
    name,
    host,
    port,
    authDbName,
} = require('../../../config/db/config');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'db connection error: '));
db.once('open', console.log.bind(console, 'db connected'));

mongoose.connect(`mongodb://${host}:${port}/${name}`, {
    user: username,
    pass: password,
    useNewUrlParser: true,
    auth: { authdb: authDbName },
});

module.exports = db;
