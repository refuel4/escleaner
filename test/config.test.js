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
    it('should return a var with getEnvVarOrError', () => {
        expect(getEnvVarOrError({key: 'value'}, 'key')).to.equal('value');
    });
    it('should throw an error with getEnvVarOrError', () => {
        expect(() => getEnvVarOrError({}, 'key')).to.throw(Error, 'variable key is not set');
    });
    it('should return an host', () => {
        expect(host).to.equal('es_server');
    });
    it('should return a log', () => {
        expect(log).to.equal('trace');
    });
    it('should return a region', () => {
        expect(region).to.equal('us-west-1');
    });
    it('should return a accessKey', () => {
        expect(accessKey).to.equal('aws_access_key');
    });
    it('should return a secretKey', () => {
        expect(secretKey).to.equal('aws_secret_key');
    });
    it('should return a storageSize', () => {
        expect(storageSize).to.equal(102400);
    });
    it('should return a storageWarning', () => {
        expect(storageWarning).to.equal(20);
    });
    it('should return a dayBack', () => {
        expect(dayBack).to.equal(3);
    });
    it('should return a segmentKey', () => {
        expect(segmentKey).to.equal('segment_key');
    });
    it('should tags to purge', () => {
        expect(tagsToPurge.length).to.be.above(0);
    });
});
