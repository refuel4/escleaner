import elasticSearch from 'elasticsearch';
import connectionClass from 'http-aws-es';
import {host, log, accessKey, secretKey, region} from './config';

const client = new elasticSearch.Client({
    host,
    log,
    connectionClass,
    amazonES: {
        region,
        accessKey,
        secretKey
    }
});

export default client;
