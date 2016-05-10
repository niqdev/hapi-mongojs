'use strict';

const Code = require('code');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const expect = Code.expect;

describe('test hapi-mongojs', () => {

  const URL = 'MY_URL';
  let MongoJsMock;
  let dbMock;
  let sandbox;

  afterEach((done) => {
    // Restore all the things made through the sandbox
    sandbox.restore();
    done()
  });

  beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    dbMock = {};
    MongoJsMock = proxyquire('../lib/index', {
      'mongojs': (connectionString) => {
        expect(connectionString).to.equal(URL);
        return dbMock;
      }
    });
    done();
  });

  it('should verify register plugin: success', (done) => {

    dbMock.runCommand = (command) => {
      expect(command).to.deep.equal({serverStatus: 1});
    };

    expect(MongoJsMock.db()).to.be.undefined();

    const spyNext = sandbox.spy();
    MongoJsMock.register({}, {url: URL}, spyNext);

    expect(MongoJsMock.db()).to.equal(dbMock);

    expect(spyNext.calledOnce).to.be.true();
    expect(spyNext.alwaysCalledWithExactly()).to.be.true();

    done();
  });

  it('should verify register plugin: error', (done) => {
    const ERROR = 'not connected';

    dbMock.runCommand = () => {
      throw ERROR;
    };

    const Server = {
      log: (params) => {
        expect(params).to.deep.equal(['hapi-mongojs', 'error']);
      }
    };
    const spyNext = sandbox.spy();

    MongoJsMock.register(Server, {url: URL}, spyNext);

    expect(spyNext.calledOnce).to.be.true();
    expect(spyNext.alwaysCalledWithExactly(ERROR)).to.be.true();

    done();
  });

  it('register with indexes for two collection that exists', (done) => {

    let collection1Mock = {};
    let collection2Mock = {};
    dbMock = {
      runCommand: (command) => {
        expect(command).to.deep.equal({serverStatus: 1});
      },
      getCollectionNames: (callBack) => {
        callBack(null, ['collection1', 'collection2', 'collection3']);
      },
      createCollection: (collectionName, callback) => {
        callback(null, 'OK');
      },
      collection: (collectionName) => {
        if (collectionName === 'collection1') {
          return collection1Mock;
        } else if (collectionName === 'collection2') {
          return collection2Mock;
        }
      }
    };

    expect(MongoJsMock.db()).to.be.undefined();

    const indexes = {
      'collection1': [
        {
          keys: {
            "field1": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index1_name",
            "ns": "database.collection1"
          }
        },
        {
          keys: {
            "field2": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index2_name",
            "ns": "database.collection1"
          }
        }
      ],
      'collection2': [
        {
          keys: {
            "field3": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index3_name",
            "ns": "database.collection2"
          }
        }
      ]
    };

    let capturedCreateIndex1Args = [];
    let capturedCreateIndex2Args = [];

    collection1Mock = {
      'createIndex': (keys, options, callback) => {
        capturedCreateIndex1Args.push({keys: keys, options: options});
        callback(null, 'response');
      }
    };

    collection2Mock = {
      'createIndex': (keys, options, callback) => {
        capturedCreateIndex2Args.push({keys: keys, options: options});
        callback(null, 'response');
      }
    };

    const onNext = (err) => {
      expect(capturedCreateIndex1Args[0].keys.field1).to.equal(1);
      expect(capturedCreateIndex1Args[0].options.name).to.equal('index1_name');

      expect(capturedCreateIndex1Args[1].keys.field2).to.equal(1);
      expect(capturedCreateIndex1Args[1].options.name).to.equal('index2_name');

      expect(capturedCreateIndex2Args[0].keys.field3).to.equal(1);
      expect(capturedCreateIndex2Args[0].options.name).to.equal('index3_name');

      expect(err).to.be.undefined();
      done();
    };

    MongoJsMock.register({}, {url: URL, indexes: indexes}, onNext);

  });

  it('register with indexes for two collection, one doesn\'t exists', (done) => {

    let collection1Mock = {};
    let collection2Mock = {};
    dbMock = {
      runCommand: (command) => {
        expect(command).to.deep.equal({serverStatus: 1});
      },
      getCollectionNames: (callBack) => {
        callBack(null, ['collection1']);
      },
      createCollection: (collectionName, callback) => {
        callback(null, 'OK');
      },
      collection: (collectionName) => {
        if (collectionName === 'collection1') {
          return collection1Mock;
        } else if (collectionName === 'collection2') {
          return collection2Mock;
        }
      }
    };

    expect(MongoJsMock.db()).to.be.undefined();

    const indexes = {
      'collection1': [
        {
          keys: {
            "field1": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index1_name",
            "ns": "database.collection1"
          }
        },
        {
          keys: {
            "field2": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index2_name",
            "ns": "database.collection1"
          }
        }
      ],
      'collection2': [
        {
          keys: {
            "field3": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index3_name",
            "ns": "database.collection2"
          }
        }
      ]
    };

    let capturedCreateIndex1Args = [];
    let capturedCreateIndex2Args = [];

    collection1Mock = {
      'createIndex': (keys, options, callback) => {
        capturedCreateIndex1Args.push({keys: keys, options: options});
        callback(null, 'response');
      }
    };

    collection2Mock = {
      'createIndex': (keys, options, callback) => {
        capturedCreateIndex2Args.push({keys: keys, options: options});
        callback(null, 'response');
      }
    };

    const onNext = (err) => {
      expect(capturedCreateIndex1Args[0].keys.field1).to.equal(1);
      expect(capturedCreateIndex1Args[0].options.name).to.equal('index1_name');

      expect(capturedCreateIndex1Args[1].keys.field2).to.equal(1);
      expect(capturedCreateIndex1Args[1].options.name).to.equal('index2_name');

      expect(capturedCreateIndex2Args[0].keys.field3).to.equal(1);
      expect(capturedCreateIndex2Args[0].options.name).to.equal('index3_name');

      expect(err).to.be.undefined();
      done();
    };

    MongoJsMock.register({}, {url: URL, indexes: indexes}, onNext);

  });

  it('register with indexes for two collection, one doesn\'t exists, and one error from ensure index', (done) => {

    let collection1Mock = {};
    let collection2Mock = {};
    dbMock = {
      runCommand: (command) => {
        expect(command).to.deep.equal({serverStatus: 1});
      },
      getCollectionNames: (callBack) => {
        callBack(null, ['collection1']);
      },
      createCollection: (collectionName, callback) => {
        callback(null, 'OK');
      },
      collection: (collectionName) => {
        if (collectionName === 'collection1') {
          return collection1Mock;
        } else if (collectionName === 'collection2') {
          return collection2Mock;
        }
      }
    };

    expect(MongoJsMock.db()).to.be.undefined();

    const indexes = {
      'collection1': [
        {
          keys: {
            "field1": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index1_name",
            "ns": "database.collection1"
          }
        },
        {
          keys: {
            "field2": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index2_name",
            "ns": "database.collection1"
          }
        }
      ],
      'collection2': [
        {
          keys: {
            "field3": 1
          },
          'options': {
            "v": 1,
            "unique": true,
            "name": "index3_name",
            "ns": "database.collection2"
          }
        }
      ]
    };

    let capturedCreateIndex1Args = [];
    let capturedCreateIndex2Args = [];

    collection1Mock = {
      'createIndex': (keys, options, callback) => {
        capturedCreateIndex1Args.push({keys: keys, options: options});
        callback(null, 'response');
      }
    };

    collection2Mock = {
      'createIndex': (keys, options, callback) => {
        capturedCreateIndex2Args.push({keys: keys, options: options});
        callback(new Error('error ensuring index2'));
      }
    };
    
    const onNext = (err) => {
      expect(capturedCreateIndex1Args[0].keys.field1).to.equal(1);
      expect(capturedCreateIndex1Args[0].options.name).to.equal('index1_name');

      expect(capturedCreateIndex1Args[1].keys.field2).to.equal(1);
      expect(capturedCreateIndex1Args[1].options.name).to.equal('index2_name');

      expect(capturedCreateIndex2Args[0].keys.field3).to.equal(1);
      expect(capturedCreateIndex2Args[0].options.name).to.equal('index3_name');

      expect(err).not.to.be.undefined();
      done();
    };

    const Server = {
      log: (params) => {
        expect(params).to.deep.equal(['hapi-mongojs', 'error']);
      }
    };

    MongoJsMock.register(Server, {url: URL, indexes: indexes}, onNext);

  });

});

