'use strict';

const mongojs = require('mongojs');

const _plugin = {};
exports.db = () => _plugin.db;

exports.register = (server, options, next) => {
  _plugin.db = mongojs(options.url);
  return next();
};

exports.register.attributes = {
  pkg: require('../package.json')
};
