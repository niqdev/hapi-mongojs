'use strict';

const mongojs = require('mongojs');

const TAG = 'hapi-mongojs';
const _plugin = {};

exports.db = () => _plugin.db;

exports.register = (server, options, next) => {
  try {
    const db = mongojs(options.url, options.collections, options.options);
    // verify connection
    db.runCommand({serverStatus: 1});
    _plugin.db = db;
  } catch (error) {
    server.log([TAG, 'error'], error);
    return next(error);
  }
  return next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
