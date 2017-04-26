import moment from 'moment';
import {storageSize, storageWarning, dayBack} from './config';

export function getIndices(client) {
    return client.cat.indices({
        format: 'json',
        bytes: 'm',
        local: false,
        h: ['index', 'store.size']
    });
}

function getDateFromIndex(index) {
    if (!index.startsWith('logstash')) {
        throw new Error('extractDateFromIndex: not an index')
    }
    return moment(index.replace('logstash-', ''), 'YYYY.MM.DD');
}

export function getLogstashIndices(payload) {
    return payload.reduce((acc, item) => {
        if (item.index.startsWith('logstash')) {
            return acc.concat(Object.assign({}, item, {date: getDateFromIndex(item.index), 'store.size': parseInt(item['store.size'])}))
        } else return acc;
    }, []);
}

export function getTotalVolume(indices) {
    return indices.reduce((acc, item) => acc + parseInt(item['store.size']), 0)
}

export function getIndexToPurge(indices) {
    // today should be the first index of sortedIndices
    const todayIndex = indices[0];
    if (todayIndex) {
        // purge the 4 previous day
        const fourDaysAgo = moment(todayIndex.date).subtract(dayBack, 'days');
        const [indexToPurge] = indices.filter(index => index.date.isSame(fourDaysAgo));
        return indexToPurge;
    }
    return undefined;
}

export function deleteByTag(client, index, tag) {
    return client.deleteByQuery({
        index,
        body: {
            query: {
                wildcard: {
                    'tag.keyword': tag
                }
            }
        }
    });
}

export function checkVolumeSizeLeft(indexesSize) {

    const threshold = storageSize * ((100 - storageWarning) / 100);
    if (indexesSize > threshold) {
        console.log('send an email');
    }
}