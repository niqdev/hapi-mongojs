'use strict';

const promisify = require('es6-promisify');
const mongojs = require('mongojs');

const TAG = 'hapi-mongojs';
const _plugin = {};

exports.db = () => _plugin.db;

const ensureIndexes = function (server, options, next, db) {

  const indexes = options.indexes;
  let promises = [];

  for (let collectionName in indexes) {

    let collectionIndexes = indexes[collectionName];
    let collection = db.collection(collectionName);
    let createIndex = promisify(collection.createIndex);

    for (let index of collectionIndexes) {
      promises.push(createIndex(index.keys, index.options));
    }
  }

  if (promises.length > 0) {
    Promise.all(promises).then(
        () => {
          next();
        },
        (err) => {
          server.log([TAG, 'error'], 'Error creating indexes. Message: '+err.message);
          next(err);
        }
    );
  } else {
    return next();
  }
};

exports.register = (server, options, next) => {
  try {
    const db = mongojs(options.url);
    // verify connection
    db.runCommand({serverStatus: 1});
    _plugin.db = db;

    ensureIndexes(server, options, next, db);

  } catch (error) {
    server.log([TAG, 'error'], error);
    return next(error);
  }
};

exports.register.attributes = {
  pkg: require('../package.json')
};
