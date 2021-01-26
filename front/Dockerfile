FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn add @angular-devkit/build-angular --dev

EXPOSE 4200

CMD yarn prod --host 0.0.0.0 --port 4200
