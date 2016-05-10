'use strict';

const Hapi = require('hapi');
const Boom = require('boom');
// IMPORT DEPENDENCY
const mongojs = require('hapi-mongojs');


// ADD PLUGIN
const plugins = [
  {
    register: require('hapi-mongojs'),
    options: {
      url: 'mongodb://localhost:27017/myDatabase'
      // ,
      // // ENSURE COLLECTION INDEXES
      // indexes: {
      //   'myCollection1': [{
      //     keys: {
      //       'aField': 1
      //     },
      //     'options': {
      //       'v': 1,
      //       'unique': true,
      //       'name': 'afield_idx',
      //       'ns': 'database.myCollection1'
      //     }
      //   }],
      //   'myCollection2': [{
      //     keys: {
      //       'anotherField': 1
      //     },
      //     'options': {
      //       'v': 1,
      //       'unique': true,
      //       'name': 'anotherfield_idx',
      //       'ns': 'database.myCollection2'
      //     }
      //   }]
      // }
    }
  }
];

const server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 8888
});

server.route({
  method: 'GET',
  path: '/status',
  handler: function (request, reply) {
    reply('OK');
  }
});

server.route({
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
});

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
    myCollection.save({ value: 'aaa' })

  });
});
