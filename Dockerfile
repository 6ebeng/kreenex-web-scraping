#Production stage

#Stage 1

FROM node:lts-alpine AS build
ENV NODE_ENV production
WORKDIR /app
COPY package*.json .
RUN npm install --production
COPY . .
RUN npm build

#Stage 2

FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
CMD [ "sh","-c", "nginx -g daemon off;" ]