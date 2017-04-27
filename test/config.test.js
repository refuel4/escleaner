// import 'babel-polyfill'
import chai from 'chai';
const expect = chai.expect;
import {host, log, region} from '../src/config';

describe('config', function() {
    it('should return an host', function() {
        expect(host).to.equal('es_server');
    });
    it('should return a log', function() {
        expect(log).to.equal('trace');
    });
    it('should return a region', function() {
        expect(region).to.equal('us-west-1');
    });
});
