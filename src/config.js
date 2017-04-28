export function getEnvVarOrError(env, variable) {
    if (!!env[variable]) {
        return env[variable];
    } else {
        throw new Error('variable ' + variable + ' is not set')
    }
}

export const host = getEnvVarOrError(process.env, 'ES_SERVER');
export const log = process.env.ES_CLIENT_LOG_LEVEL || 'error';
export const region = process.env.AWS_REGION || 'us-west-1';
export const accessKey = getEnvVarOrError(process.env, 'AWS_ACCESS_KEY');
export const secretKey = getEnvVarOrError(process.env, 'AWS_SECRET_KEY');
export const storageSize = parseFloat(getEnvVarOrError(process.env, 'STORAGE_SIZE')) * 1024;    // get the size in Mb
export const storageWarning = parseFloat(process.env.STORAGE_THRESHOLD || '20');
export const dayBack = parseInt(process.env.DAY_BACK || '3');
export const segmentKey = getEnvVarOrError(process.env, 'SEGMENT_KEY');
export const requestTimeout = parseInt(process.env.REQUEST_TIMEOUT || '10') * 60000;


export const tagsToPurge = [
    'fluent.*',
    '*-salt',
    '*-startupscript',
    '*-docker',
    '*-etcd',
    '*-kubelet',
    '*-kube-proxy',
    '*-kube-apiserver',
    '*-kube-controller-manager',
    '*-kube-scheduler',
    '*-rescheduler',
    '*-glbc',
    '*-cluster-autoscaler'
];

