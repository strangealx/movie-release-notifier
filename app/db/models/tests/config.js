require('dotenv').config({ path: './app/db/models/tests/.env' });
require('dotenv').config();

const {
    AUTH_DB_NAME,
    DB_NAME,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_PORT,
} = process.env;

const config = {
    authDbName: AUTH_DB_NAME || 'admin',
    name: DB_NAME,
    host: DB_HOST || 'localhost',
    username: DB_USER || 'admin',
    password: DB_PASSWORD,
    port: DB_PORT || 27017,
};

module.exports = config;
