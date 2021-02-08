FROM node:lts-alpine as builder

ENV NODE_ENV=production

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

RUN yarn add @angular-devkit/build-angular --dev

COPY . .

RUN yarn ng build --prod


FROM nginx

COPY --from=builder /app/dist/maquette-v1 /usr/share/nginx/html

RUN rm -rf /etc/nginx/conf.d
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
