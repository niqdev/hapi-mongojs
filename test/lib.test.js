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

    MongoJsMock.register({}, {url: URL}, (reason) => {
      expect(reason).to.be.undefined();
      done();
    });

    expect(MongoJsMock.db()).to.equal(dbMock);

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

  it('should verify register plugin: indexes', (done) => {

    const collections = [
      {
        name: 'myCollection1',
        indexes: [
          {
            keys: {
              'field1': 1
            },
            options: {
              'v': 1,
              'unique': true,
              'name': 'index1_name',
              'ns': 'database.collection1'
            }
          },
          {
            keys: {
              'field2': 1
            },
            options: {
              'v': 1,
              'unique': true,
              'name': 'index2_name',
              'ns': 'database.collection1'
            }
          }
        ]
      },
      {
        name: 'myCollection2',
        indexes: [
          {
            keys: {
              'field3': 1
            },
            options: {
              'v': 1,
              'unique': true,
              'name': 'index3_name',
              'ns': 'database.collection2'
            }
          }
        ]
      }
    ];

    dbMock = {
      runCommand: (command) => {
        expect(command).to.deep.equal({serverStatus: 1});
      },
      collection: sandbox.stub()
    };

    const createIndexStub1 = sandbox.stub();
    createIndexStub1
      .withArgs(collections[0].indexes[0].keys, collections[0].indexes[0].options)
      .callsArgWith(2, null, collections[0].indexes[0].options.name)
      .withArgs(collections[0].indexes[1].keys, collections[0].indexes[1].options)
      .callsArgWith(2, null, collections[0].indexes[1].options.name);

    dbMock.collection.withArgs(collections[0].name).returns({
      createIndex: createIndexStub1
    });

    dbMock.collection.withArgs(collections[1].name).returns({
      createIndex: sandbox.stub()
        .withArgs(collections[1].indexes[0].keys, collections[1].indexes[0].options)
        .callsArgWith(2, null, collections[1].indexes[0].options.name)
    });

    expect(MongoJsMock.db()).to.be.undefined();

    const promiseMock = sandbox.spy(Promise, 'all');

    const onNext = (err) => {
      expect(promiseMock.calledOnce).to.be.true();
      expect(err).to.be.undefined();
      done();
    };

    const Server = {
      log: (params) => {
        expect(params).to.deep.equal(['hapi-mongojs', 'info']);
      }
    };

    MongoJsMock.register(Server, {url: URL, collections}, onNext);

  });

});

