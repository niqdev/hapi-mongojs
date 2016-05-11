'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
// IMPORT NPM DEPENDENCY
//const mongojs = require('hapi-mongojs');
const mongojs = require('../lib/index');

// ADD PLUGINS CONFIG
const plugins = [
  require('./plugins/hapi-mongojs-config')
];

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 8888
});

server.route([
  {
    method: 'GET',
    path: '/status',
    handler: function (request, reply) {
      reply('OK');
    }
  },
  {
    method: 'GET',
    path: '/example',
    handler: function (request, reply) {

      // GET DB CONNECTION
      const myCollection = mongojs.db().collection('myCollection1');

      // EXECUTE QUERY
      myCollection.find((error, value) => {
        if (error) {
          return reply(Boom.badData('Internal MongoDB error', error));
        }
        reply(value);
      });

    }
  }
]);

server.register(plugins, (err) => {
  if (err) {
    console.error(err);
    throw err;
  }

  server.start((err) => {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log('info', `Server running at: ${server.info.uri}`);
  });

  server.on('start', () => {

    // GET DB CONNECTION
    const myCollection = mongojs.db().collection('myCollection1');

    // EXECUTE QUERY
    myCollection.save({ aField: 'value1' });
    myCollection.save({ aField: 'value2' });
    myCollection.save({ aField: 'value3' });

  });
});
