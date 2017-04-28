// import 'babel-polyfill'
import chai from 'chai';
const expect = chai.expect;
import {
  getEnvVarOrError,
  host,
  log,
  region,
  accessKey,
  secretKey,
  storageSize,
  storageWarning,
  dayBack,
  segmentKey,
  tagsToPurge
} from '../src/config';

describe('config', function () {
  it('should return a var with getEnvVarOrError', function () {
    expect(getEnvVarOrError({key: 'value'}, 'key')).to.equal('value');
  });
  it('should throw an error with getEnvVarOrError', function () {
    expect(() => getEnvVarOrError({}, 'key')).to.throw(Error, 'variable key is not set');
  });
  it('should return an host', function () {
    expect(host).to.equal('es_server');
  });
  it('should return a log', function () {
    expect(log).to.equal('trace');
  });
  it('should return a region', function () {
    expect(region).to.equal('us-west-1');
  });
  it('should return a accessKey', function () {
    expect(accessKey).to.equal('aws_access_key');
  });
  it('should return a secretKey', function () {
    expect(secretKey).to.equal('aws_secret_key');
  });
  it('should return a storageSize', function () {
    expect(storageSize).to.equal(102400);
  });
  it('should return a storageWarning', function () {
    expect(storageWarning).to.equal(20);
  });
  it('should return a dayBack', function () {
    expect(dayBack).to.equal(3);
  });
  it('should return a segmentKey', function () {
    expect(segmentKey).to.equal('segment_key');
  });
  it('should tags to purge', function () {
    expect(tagsToPurge.length).to.be.above(0);
  });
});
