FROM node:7.9.0-alpine

RUN mkdir -p /opt/app/dist

WORKDIR /opt/app

ADD package.json /opt/app
ADD yarn.lock /opt/app
ADD dist/ /opt/app/dist/

RUN yarn

CMD [ "node", "dist/index.js" ]