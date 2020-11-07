FROM node:14 as builder

COPY . blog

WORKDIR blog

RUN yarn install --emoji --frozen-lockfile --no-progress && \
    yarn build

FROM nginx:1.19

COPY --from=builder /blog/dist /usr/share/nginx/html
COPY nginx/templates/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
