import "babel-polyfill";
import co from 'co';
import client from './client';
import {tagsToPurge} from './config';
import {
    getIndices,
    getTotalVolume,
    getLogstashIndices,
    getIndexToPurge,
    deleteByTag,
    checkVolumeSizeLeft
} from './helpers';

co(function*() {

    const payload = yield getIndices(client);
    const indices = getLogstashIndices(payload);

    // reverse sort
    const sortedIndices = indices.sort((a, b) => b.date.diff(a.date));
    const total = getTotalVolume(sortedIndices);

    checkVolumeSizeLeft(total);

    const indexToPurge = getIndexToPurge(sortedIndices);

    console.log('index to purge is', indexToPurge.index, 'of size ', indexToPurge['store.size']);

    const response = yield tagsToPurge.map((tag) => deleteByTag(client, indexToPurge.index, tag));
    const responseAggregated = response.reduce((acc, val, i) => Object.assign(acc, {[sortedIndices[i].index]: val}), {});

    // TODO send data to segment
    console.log(responseAggregated);

}).catch((err) => {
    console.error('An error has occurred:', err);
    throw err;
});
