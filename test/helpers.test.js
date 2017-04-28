import 'babel-polyfill'
import moment from 'moment';
import chai from 'chai';
import sinon from 'sinon';
const expect = chai.expect;
import {storageSize} from '../src/config';
import {
    getDateFromIndex,
    getLogStashIndices,
    getTotalVolume,
    getIndexToPurge,
    deleteByTag,
    checkVolumeSizeLeft,
    purge
} from '../src/helpers';

// Mocked ES client
class Client {
    deleteByQuery(params) {
        return params
    }
}

const deleteByTagExpected = (index, tag) => ({
    index,
    body: {
        query: {
            wildcard: {
                'tag.keyword': tag
            }
        }
    }
});

describe('helpers', () => {
    describe('getDateFromIndex', () => {
        it('should return a date from an index name', () => {
            expect(getDateFromIndex('logstash-2017.01.01').isSame(moment('2017-01-01'))).to.be.true;
        });
        it('should throw an error if index not prefixed by "logstash"', () => {
            expect(() => getDateFromIndex('kibana')).to.throw(Error, 'getDateFromIndex: not an index');
        });
    });
    describe('getLogStashIndices', () => {
        it('should return indices prefixed as `logstash` and add `date` key', () => {
            const indices = [
                {index: '.kibana', 'store.size': '10'},
                {index: 'logstash-2017.01.01', 'store.size': '20'},
                {index: 'logstash-2017.01.02', 'store.size': '30'},
                {index: 'another_index', 'store.size': '15'},
            ];
            const result = getLogStashIndices(indices);
            expect(result.length).to.equal(2);
            expect(result[0].index).to.be.equal('logstash-2017.01.01');
            expect(result[0]['store.size']).to.be.equal(20);
            expect(result[0].date.isSame(moment('2017.01.01', 'YYYY.MM.DD'))).to.be.true;
            expect(result[1].index).to.be.equal('logstash-2017.01.02');
            expect(result[1]['store.size']).to.be.equal(30);
            expect(result[1].date.isSame(moment('2017.01.02', 'YYYY.MM.DD'))).to.be.true;
        });
    });
    describe('getTotalVolume', () => {
        it('should return the total volume of indices', () => {
            const indices = [
                {index: '.kibana', 'store.size': 10},
                {index: 'logstash-2017.01.01', 'store.size': 20},
                {index: 'logstash-2017.01.02', 'store.size': 30},
                {index: 'another_index', 'store.size': 15},
            ];
            expect(getTotalVolume(indices)).to.equal(75);
        });
    });
    describe('getIndexToPurge', () => {
        it('should return undefined if empty array', () => {
            expect(getIndexToPurge([])).to.be.undefined;
        });
        it('should return undefined if date not found', () => {
            const indices = [
                {index: 'logstash-2017.01.30', date: moment('2017-01-30')},
                {index: 'logstash-2017.01.29', date: moment('2017-01-29')},
                {index: 'logstash-2017.01.28', date: moment('2017-01-28')},
                // {index: 'logstash-2017.01.27', date: moment('2017-01-27')},
                {index: 'logstash-2017.01.26', date: moment('2017-01-26')},
            ];
            expect(getIndexToPurge(indices)).to.be.undefined;
        });
        it('should return an index', () => {
            const indices = [
                {index: 'logstash-2017.01.30', date: moment('2017-01-30')},
                {index: 'logstash-2017.01.29', date: moment('2017-01-29')},
                {index: 'logstash-2017.01.28', date: moment('2017-01-28')},
                {index: 'logstash-2017.01.27', date: moment('2017-01-27')},
                {index: 'logstash-2017.01.26', date: moment('2017-01-26')},
            ];
            const result = getIndexToPurge(indices);
            expect(result.index).to.be.equal(indices[3].index);
            expect(result.date.isSame(indices[3].date)).to.be.true;
        });
    });
    describe('checkVolumeSizeLeft', () => {
        it('should not call the callback', () => {
            const callback = sinon.spy();
            const indexesSize = 70 * 1024;  // 70Gb
            checkVolumeSizeLeft(indexesSize, callback);
            expect(callback.called).to.be.false;
        });
        it('should call the callback', () => {
            const callback = sinon.spy();
            const indexesSize = 90 * 1024;  // 90Gb
            checkVolumeSizeLeft(indexesSize, callback);
            expect(callback.calledOnce).to.be.true;
            expect(callback.calledWith({storageSize, indexesSize})).to.be.true;
        });
    });
    describe('deleteByTag', () => {
        it('should not call the callback', () => {

            const index = 'logstash-2017.01.30';
            const tag = 'custom-tag';
            const client = new Client();
            expect(deleteByTag(client, index, tag)).to.deep.equal(deleteByTagExpected(index, tag))

        });
    });
    describe('purge', () => {
        it('should return undefined', () => {

            const index = 'logstash-2017.01.30';
            const tags = [];
            const client = new Client();
            const trackFn = sinon.spy();

            const generator = purge(client, index, tags, deleteByTag, trackFn);
            expect(generator.next()).to.deep.equal({value: undefined, done: true});

        });
        it('should purge', () => {

            const index = 'logstash-2017.01.30';
            const tags = ['tag-one', 'tag-two'];
            const client = new Client();
            const trackFn = sinon.spy();

            const generator = purge(client, index, tags, deleteByTag, trackFn);
            let response = generator.next();
            expect(response.done).to.be.false;
            expect(response.value).to.deep.equal(deleteByTagExpected(index, tags[0]));
            response = generator.next();
            expect(response.done).to.be.false;
            expect(response.value).to.deep.equal(deleteByTagExpected(index, tags[1]));
            response = generator.next();
            expect(response).to.deep.equal({value: undefined, done: true});

        });
    });
});
