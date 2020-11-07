FROM node:14 as builder

COPY . blog

WORKDIR blog

ARG HTTP_PREFIX
ENV HTTP_PREFIX $HTTP_PREFIX

RUN yarn install --emoji --frozen-lockfile --no-progress && \
    NODE_ENV=production yarn build

FROM nginx:1.19

COPY --from=builder /blog/dist /usr/share/nginx/html
COPY nginx/templates/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
