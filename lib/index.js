'use strict';

const promisify = require('es6-promisify');
const mongojs = require('mongojs');

const TAG = 'hapi-mongojs';
const _plugin = {};

exports.db = () => _plugin.db;

function addCollectionToMapAndResolve(collectionsMap, collectionName) {
  collectionsMap[collectionName] = _plugin.db.collection(collectionName);
  return Promise.resolve();
}

const _getEnsuredCollections = function (collectionNames) {

  const getDBCollectionNames = promisify(_plugin.db.getCollectionNames);
  const createCollection = promisify(_plugin.db.createCollection);
  let collectionsMap = new Map();
  let ensureCollectionPromises = [];

  return getDBCollectionNames()
    .then((dbCollectionNames) => {
      for (let collectionName of collectionNames) {
        if (dbCollectionNames.find(x => x === collectionName)) {
          ensureCollectionPromises.push(addCollectionToMapAndResolve(collectionsMap, collectionName));
        } else { //createCollections
          ensureCollectionPromises.push(
            createCollection(collectionName).then(()=> {
              addCollectionToMapAndResolve(collectionsMap, collectionName);
            })
          );
        }
      }
    })
    .then(() => {
      return Promise.all(ensureCollectionPromises);
    })
    .then(() => {
      return collectionsMap;
    });
};

const _ensureIndexes = function (server, options, next) {

  const indexes = options.indexes;
  let collectionNames = [];

  for (let collectionName in indexes) {
    collectionNames.push(collectionName);
  }

  let ensureIndexePromises = [];

  if (collectionNames.length === 0) {
    next();
  } else {
    _getEnsuredCollections(collectionNames)
      .then((collectionsMap) => {
        for (let collectionName in collectionsMap) {

          let collectionIndexes = indexes[collectionName];
          let collection = collectionsMap[collectionName];
          let createIndex = promisify(collection.createIndex);

          for (let index of collectionIndexes) {
            ensureIndexePromises.push(createIndex(index.keys, index.options));
          }
        }
        return Promise.all(ensureIndexePromises);
      })
      .then(() => next())
      .catch((err) => {
        server.log([TAG, 'error'], 'Error creating indexes. Message: ' + err.message);
        next(err);
      });
  }
};

exports.register = (server, options, next) => {
  try {
    const db = mongojs(options.url);
    // verify connection
    db.runCommand({serverStatus: 1});
    _plugin.db = db;

    _ensureIndexes(server, options, next, db);

  } catch (error) {
    server.log([TAG, 'error'], error);
    return next(error);
  }
};

exports.register.attributes = {
  pkg: require('../package.json')
};
