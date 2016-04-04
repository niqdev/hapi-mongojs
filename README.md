# hapi-mongojs

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

> work in progress!

A tiny plugin to share a common MongoDB connection pool across the whole Hapi server using [mongojs](https://github.com/mafintosh/mongojs).

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
      url: 'mongodb://localhost:27017/myDatabase'
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
        reject(Boom.badData('Internal MongoDB error', error));
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

[npm-image]: https://img.shields.io/npm/v/hapi-mongojs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/hapi-mongojs
[travis-image]: https://travis-ci.org/niqdev/hapi-mongojs.svg?branch=master
[travis-url]: https://travis-ci.org/niqdev/hapi-mongojs
