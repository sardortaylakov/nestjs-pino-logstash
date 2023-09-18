# nestjs-pino-logstash
NestJS sample app that uses Pino logger with Logstash

## Goals
Using [pino](https://getpino.io/#/) for logging in NestJS application, as an alternative to standard Nest logger or log4js, provides some extra functionality out of the box. Pino brings metadata about each request and response such as request method, URL, headers, etc. It also generates request ID that can be used as correlation or trace ID to group logs together, which is very useful when monitoring logs or investigating something in production. When using pino, you may want to override default configuration to customize the format of your logs or use a custom destination for logs to be transported.

By default when using [nestjs-pino](https://www.npmjs.com/package/nestjs-pino), you get the following format when logging a message to the console:
```
{
    "level": 30,
    "time": 1694997476451,
    "pid": 83389,
    "hostname": "local",
    "req": {
        "id": 1,
        "method": "GET",
        "url": "/api/hello",
        "query": {},
        "params": {
            "0": "api/hello"
        },
        "headers": {
            "user-agent": "PostmanRuntime/7.32.3",
            "accept": "*/*",
            "postman-token": "85eb8ab1-b8ed-4814-ac48-87c3bdb5d6b2",
            "host": "localhost:3000",
            "accept-encoding": "gzip, deflate, br",
            "connection": "keep-alive"
        },
        "remoteAddress": "::1",
        "remotePort": 54208
    },
    "context": "AppController",
    "msg": "Processing request in AppController."
}
```
Using [pino-http](https://www.npmjs.com/package/pino-http) configuration parameters, we are going to customize logs to get the following format:
```
{
    "level": "INFO",
    "time": 1694998573691,
    "correlation_id": "9e2b9c95-b64a-4eda-b8be-2d015d01feff",
    "request_method": "GET",
    "request_url": "/api/hello",
    "environment": "local",
    "user_id": "627ee609-f509-4e78-930e-eb87d2ca502f",
    "logger_name": "AppController",
    "message": "Processing request in AppController."
}
```
We will also use [pino-pretty](https://www.npmjs.com/package/pino-pretty) to format logs in the console when developing locally, and use [pino-socket](https://www.npmjs.com/package/pino-socket) to send logs to [logstash](https://www.elastic.co/logstash) in other environments.

## How to run the app

1. Run `docker-compose up` to start the Logstash container.
2. Run `npm run start` to start the NestJS app.

## Implementation steps

1. Create a new project using [Nest CLI](https://docs.nestjs.com/first-steps) by running `nest new nestjs-pino-logstash`
2. Install [nestjs-pino](https://www.npmjs.com/package/nestjs-pino) by running `npm i nestjs-pino` 
3. Configure pino logger for the application as shown [here](https://github.com/iamolegga/nestjs-pino#example)
4. Add sample logs in `src/app.controller.ts` and `src/app.service.ts` using standard Nest [Logger](https://docs.nestjs.com/techniques/logger)
5. Customize log format using [pino-http](https://www.npmjs.com/package/pino-http) configuration parameters
6. Assign `user_id` as metadata to each log in runtime in `src/app.controller.ts` as described [here](https://github.com/iamolegga/nestjs-pino#assign-extra-fields-for-future-calls)
7. Configure [ELK stack](https://www.elastic.co/blog/getting-started-with-the-elastic-stack-and-docker-compose) using docker-compose
    * add `docker-compose.yml` file with container configurations for ELK
    * under `logstash` directory, add config files for logstash
8. Install Nest [configuration](https://docs.nestjs.com/techniques/configuration) module to configure application properties by running `npm i --save @nestjs/config`
9. Use asynchronous configuration for pino logger as described [here](https://github.com/iamolegga/nestjs-pino#asynchronous-configuration)
10. Install [pino-socket](https://www.npmjs.com/package/pino-socket) by running `npm i pino-socket`
11. Install [pino-pretty](https://www.npmjs.com/package/pino-pretty) by running `npm i pino-pretty`
12. Configure [pino transport](https://getpino.io/#/docs/transports) to print logs to console using `pino-pretty` in local development and to send logs to logstash using `pino-socket` in other environments

## View logs in Kibana

You can view logs in Kibana locally by setting environment variable `LOCAL` to `false` and by starting both the application and docker containers. Once app and containers are running, you can see startup logs both in console and in Kibana by navigating to http://localhost:5601. Index is automatically created with `logstash-` prefix in the name. You can locate index under Management > Stack Management > Data > Index Management. Create index pattern as `logstash-*` under Management > Stack Management > Kibana > Index Patterns and view your logs sent from the application under Analytics > Discover specifying index pattern you created, that is `logstash-*`.