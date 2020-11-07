FROM nginx:1.19

COPY . blog
WORKDIR blog

ARG HTTP_PREFIX
ENV HTTP_PREFIX $HTTP_PREFIX

RUN apt-get update && \
    apt-get -y install curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get -y install nodejs && \
    apt-get install -y git && \
    npm install -g yarn

RUN yarn install --emoji --frozen-lockfile --no-progress && \
    yarn build && \
    yarn install --emoji --frozen-lockfile --no-progress --production && \
    cp -r dist/* /usr/share/nginx/html

COPY nginx/templates/default.conf.template /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]
