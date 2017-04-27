import Analytics from 'analytics-node';
import {segmentKey} from './config';

// Segment client
const analytics = new Analytics(segmentKey);

/**
 * Track a successful event of a purged tag to segment
 * @param {string} index
 * @param {string} tag
 * @param {object} properties
 * @returns {*}
 */
export function tagPurgedTrack(index, tag, properties) {
    analytics.track({
        userId: 'escleaner',
        event: 'TAGS_PURGED',
        properties: Object.assign(properties, {index, tag})
    });
}

/**
 * Track a failed event of a purged tag to segment
 * @param {object} properties
 * @returns {*}
 */
export function tagsPurgedErrorTrack(properties) {
    analytics.track({
        userId: 'escleaner',
        event: 'TAGS_PURGED_ERROR',
        properties
    });
}

/**
 * Track Elastic Search storage volume
 * @param {object} properties
 * @returns {*}
 */
export function storageWarningTrack(properties) {
    analytics.track({
        userId: 'escleaner',
        event: 'STORAGE_WARNING',
        properties
    });
}
