FROM node:12-alpine as build

WORKDIR /usr/src/client

COPY client/*.json ./

RUN npm config set unsafe-perm true
RUN npm install

COPY client/ .

RUN npm run build

FROM node:12-alpine

WORKDIR /usr/src/server

COPY node-server/*.json ./

RUN npm config set unsafe-perm true
RUN npm install

COPY node-server/ .
RUN npm run build

COPY --from=build /usr/src/client/build ./build

CMD [ "npm", "run", "prod" ]