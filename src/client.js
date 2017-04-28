import elasticSearch from 'elasticsearch';
import connectionClass from 'http-aws-es';
import {host, log, accessKey, secretKey, region, requestTimeout} from './config';

// Elastic Search client (quite obvious isn't it? o.O)
const client = new elasticSearch.Client({
    host,
    log,
    connectionClass,
    requestTimeout,
    amazonES: {
        region,
        accessKey,
        secretKey
    }
});

export default client;
