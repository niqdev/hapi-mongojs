# hapi-mongojs

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![codecov.io][codecov-image]][codecov-url]

A tiny plugin to share a common MongoDB connection pool across the whole Hapi server using [mongojs](https://github.com/mafintosh/mongojs).

It ensures collections indexes from the options configuration.

### Setup
`npm install --save hapi-mongojs`

### Example
```javascript

'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
// IMPORT DEPENDENCY
const mongojs = require('hapi-mongojs');

// ADD PLUGIN
const plugins = [
  {
    register: mongojs,
    options: {
      url: 'mongodb://localhost:27017/myDatabase',
      // for ensure the collections indexes
      indexes: {
        'collection1': [{
          keys: {
            'aField': 1
          },
          'options': {
            'v': 1,
            'unique': true,
            'name': 'index_name',
            'ns': 'database.collection1'
          }
        }],
          'collection2': [{
          keys: {
            'anotherFIeld': 1
          },
          'options': {
            'v': 1,
            'unique': true,
            'name': 'index_name',
            'ns': 'database.collection2'
          }
        }]
      };
    }
  }
];

const server = new Hapi.Server();

server.connection({
  host: localhost,
  port: 3000
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
  
    // GET DB CONNECTION
    const myCollection = mongojs.db().collection('myCollection');
    
    // EXECUTE QUERY
    myCollection.find((error, value) => {
      if (error) {
        return reply(Boom.badData('Internal MongoDB error', error));
      }
      reply(value);
    });
    
  }
});

server.register(plugins, (err) => {
  if (err) {
    throw err;
  }

  server.start((err) => {
    if (err) {
      throw err;
    }
    server.log('info', `Server running at: ${server.info.uri}`);
  });
});

```

[npm-image]: https://img.shields.io/npm/v/hapi-mongojs.svg
[npm-url]: https://www.npmjs.com/package/hapi-mongojs
[travis-image]: https://travis-ci.org/niqdev/hapi-mongojs.svg?branch=master
[travis-url]: https://travis-ci.org/niqdev/hapi-mongojs
[codecov-image]: https://codecov.io/github/niqdev/hapi-mongojs/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/niqdev/hapi-mongojs?branch=master
