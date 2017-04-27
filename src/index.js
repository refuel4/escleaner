import "babel-polyfill";
import co from 'co';
import client from './client';
import {tagsPurgedErrorTrack} from './analytics';
import {purge} from './helpers';
import {tagsToPurge} from './config';
import {
    getIndices,
    getTotalVolume,
    getLogStashIndices,
    getIndexToPurge,
    checkVolumeSizeLeft
} from './helpers';

co(function*() {

    const payload = yield getIndices(client);
    const indices = getLogStashIndices(payload);

    // reverse sort
    const sortedIndices = indices.sort((a, b) => b.date.diff(a.date));
    const total = getTotalVolume(sortedIndices);

    checkVolumeSizeLeft(total);

    const indexToPurge = getIndexToPurge(sortedIndices);

    console.log('index to purge is', indexToPurge.index, 'of size ', indexToPurge['store.size']);

    yield * purge(client, indexToPurge.index, tagsToPurge);

}).catch((err) => {
    console.error('An error has occurred:', err);
    tagsPurgedErrorTrack(err);
    throw err;
});
