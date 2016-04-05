'use strict';

const Code = require('code');
const Lab = require('lab');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;

describe('test hapi-mongojs', () => {

  const URL = 'MY_URL';
  let MongoJsMock;
  let dbMock;

  before((done) => {
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

    const spyNext = sinon.spy();
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
    const spyNext = sinon.spy();

    MongoJsMock.register(Server, {url: URL}, spyNext);

    expect(spyNext.calledOnce).to.be.true();
    expect(spyNext.alwaysCalledWithExactly(ERROR)).to.be.true();

    done();
  });

});
