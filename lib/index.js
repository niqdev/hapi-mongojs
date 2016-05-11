'use strict';

const mongojs = require('mongojs');

const TAG = 'hapi-mongojs';
const _plugin = {};

exports.db = () => _plugin.db;

const _createIndexes = (name, indexes) => {

  const createIndex = (index) => {
    return new Promise((resolve, reject) => {
      _plugin.db.collection(name).createIndex(index.keys, index.options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve({ collection: name, index: res });
        }
      });
    });
  };

  const result = indexes.reduce((promises, index) => {
    promises.push(createIndex(index));
    return promises;
  }, []);

  return result;
};

const _getIndexes = (options) => {
  const collections = options.collections || [];

  return collections.reduce((promises, collection) => {
    return promises.concat(_createIndexes(collection.name, collection.indexes || []));
  }, []);
};

const _ensureIndexes = (server, options, next) => {
  Promise.all(_getIndexes(options)).then(
    (value) => {
      (value || []).forEach(item => server.log([TAG, 'info'], `create index: ${item.collection} => ${item.index}`));
      next();
    },
    (reason) => {
      server.log([TAG, 'error'], reason);
      next(reason);
    });
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
