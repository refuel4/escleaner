# ESCLEANER

A cleaning tool for Elastic Search

## What does it do and how

### list the indexes

List the indexes prefixed as `logstash-*` (DSL would be `GET _cat/indices`)

### Control the Elastic Search storage volume

Aggregate the size of the indices and control if the used volume is inferior to the % given by `STORAGE_THRESHOLD` relatively to the storage size `STORAGE_SIZE`

### Purge 1 index

Find the index to purge is done by getting the last index in date then looking for an index 
that would be older of `DAY_BACK` days.

Let's give an example and assume we have the following indices (this data structure is arbitrary):

```
['logstash-2017.04.26', 'logstash-2017.04.25', ..., 'logstash-2017.04.20']
```
and `DAY_BACK=3`, the code will search for a date `3` days ago `2017.04.23` 
relatively to `2017.04.26` which is the most recent index

From there a list of specific `tag` will be removed from `logstash-2017.04.23` index. The list can be found in `src/config.js`

For each `tag` the DSL query would be:

```
POST logstash-2017.04.23/_delete_by_query
{
  "query": {
    "wildcard": {
      "tag.keyword": "{{tagName}}"
    }
  }
}
```

### Segment

Finally the result of the purge is sent to segment

## Dependencies

With `yarn`:

```
> yarn
```

With `npm`:

```
> npm i
```

## How to develop

Run the watcher and develop in `src`

```bash
yarn run watch
```

## How to build 

```bash
yarn run build
```

## How to build the docker image

```bash
docker build -t escleaner .
```

## How to build the docker image locally

- copy `docker.env.default` to `docker.env`
- fill up the missing variables in `docker.env`
- run the script `docker_run.sh`

## Environment variables

 - ES_SERVER: Elastic Search server url
 - ES_CLIENT_LOG_LEVEL: Elastic Search client log level (default: error)
 - AWS_REGION: AWS region (default: us-west-1)
 - AWS_ACCESS_KEY: aws access key (no default)
 - AWS_SECRET_KEY: aws secret key (no default)
 - DAY_BACK: how many days back is the day to purge (default: 3)
 - STORAGE_SIZE: Elastic Search storage size in Gb (no default)
 - STORAGE_THRESHOLD: Will send a notification if storage left is less than value in % (default: 20)
 - SEGMENT_KEY: Segment writeKey

