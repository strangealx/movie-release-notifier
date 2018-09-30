const { username, password, name, host, port, authDbName } = require('../../../config/db/config.json').db;
const mongoose = require('mongoose');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'db connection error: '));

db.once('open', () => {
   console.log('db connected')
});

mongoose.connect(`mongodb://${host}:${port}/${name}`, {
    user: username,
    pass: password,
    useNewUrlParser: true,
    auth: { authdb: authDbName }
});

module.exports = db; 