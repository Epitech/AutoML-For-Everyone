FROM node:lts-alpine

WORKDIR /app/angular

RUN yarn install

EXPOSE 4200

CMD yarn ng serve --host 0.0.0.0 --port 4200
