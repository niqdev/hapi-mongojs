# hapi-mongojs

A tiny plugin to share a common MongoDB connection pool across the whole Hapi server using [mongojs](https://github.com/mafintosh/mongojs).

### Setup
`npm install --save hapi-mongojs`

### Example
```javascript

'use strict';

const plugins = [
  {
    register: require('hapi-mongojs'),
    options: {
      url: 'mongodb://localhost:27017/myDatabase'
    }
  }
];

const Hapi = require('hapi');
const mongojs = require('hapi-mongojs');
const Boom = require('boom');

const server = new Hapi.Server();

server.connection({
  host: localhost,
  port: 3000
});

server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
  
    const myCollection = mongojs.db().collection('myCollection');
    
    myCollection.find((error, value) => {
      if (error) {
        return reply(Boom.badData('Internal MongoDB error', error));
      }
      reply(value);
    });
    
  }
});

server.register(plugins, (err) => {
  // something bad happened loading the plugin
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
