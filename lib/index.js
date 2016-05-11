'use strict';

const mongojs = require('mongojs');

const TAG = 'hapi-mongojs';
const _plugin = {};

exports.db = () => _plugin.db;

const _ensureIndexes = (server, options, next) => {

  const createIndexes = (name, indexes) => {
    indexes.forEach(index => {
      _plugin.db.collection(name)
        .createIndex(index.keys, index.options, (err, res) => {
          if (err) {
            server.log([TAG, 'error'], err);
            next(err);
          }
        });
    });
  };

  const collections = options.collections || [];
  collections.forEach(collection => {
    if (collection.name) {
      createIndexes(collection.name, collection.indexes || []);
    }
  });

  next();
};

exports.register = (server, options, next) => {
  try {
    const db = mongojs(options.url);
    // verify connection
    db.runCommand({serverStatus: 1});
    _plugin.db = db;

    _ensureIndexes(server, options, next);

  } catch (error) {
    server.log([TAG, 'error'], error);
    return next(error);
  }
};

exports.register.attributes = {
  pkg: require('../package.json')
};
