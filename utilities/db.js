const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

if (process.env.mongoUrl) {
    url = process.env.mongoUrl
}

let db = undefined;

MongoClient.connect(url, function (err, client) {
    module.exports.db = client.db('token-engine');
});

