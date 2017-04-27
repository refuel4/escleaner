import moment from 'moment';
import {storageWarningTrack, tagPurgedTrack} from './analytics';
import {storageSize, storageWarning, dayBack} from './config';

/**
 * Get the the list of indices from ES
 * @param {object} client - Elastic Search Client
 * @returns {Promise}
 */
export function getIndices(client) {
    return client.cat.indices({
        format: 'json',
        bytes: 'm',
        local: false,
        h: ['index', 'store.size']
    });
}

/**
 * Get the date from and index
 * @param index
 * @returns {*|moment.Moment}
 */
export function getDateFromIndex(index) {
    if (!index.startsWith('logstash')) {
        throw new Error('extractDateFromIndex: not an index')
    }
    return moment(index.replace('logstash-', ''), 'YYYY.MM.DD');
}

/**
 * Get indices prefixed as `logstash` and add `date` key with Moment matching the index date
 * @param indices
 * @returns {*}
 */
export function getLogStashIndices(indices) {
    return indices.reduce((acc, item) => {
        if (item.index.startsWith('logstash')) {
            return acc.concat(Object.assign({}, item, {date: getDateFromIndex(item.index), 'store.size': parseInt(item['store.size'])}))
        } else return acc;
    }, []);
}

/**
 * Aggregate the total volume of a list of indices
 * @param {Array<object>} indices - Array of indices
 * @returns {*}
 */
export function getTotalVolume(indices) {
    return indices.reduce((acc, item) => acc + parseInt(item['store.size']), 0)
}

/**
 * Get the index to purge
 * @param {Array<object>} indices - Array of indices
 * @returns {*}
 */
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

/**
 * Elastic Search delete by tag
 * @param {object} client - Elastic Search Client
 * @param index - Elastic Search index name
 * @param tag - Elastic Search tag name
 * @returns {*}
 */
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

/**
 * Check volume size left and notify segment if reaches threshold
 * @param {number} indexesSize - Aggregated size of all ES indices
 * @returns {*}
 */
export function checkVolumeSizeLeft(indexesSize) {
    const threshold = storageSize * ((100 - storageWarning) / 100);
    if (indexesSize > threshold) {
        storageWarningTrack({storageSize, indexesSize})
    }
}

/**
 * Purge generator
 * @param {object} client - Elastic Search Client
 * @param index - Elastic Search index name
 * @param tags - Tags to purge
 * @returns {*}
 */
export function* purge(client, index, tags) {
    let [tag] = tags;
    if (tag) {
        console.log(`Purging ${index} for tag ${tag}`);
        const response = yield deleteByTag(client, index, tag);
        // send response to segment
        tagPurgedTrack(index, tag, response);
        // recurse
        yield* purge(client, index, tags.slice(1))
    }
}
