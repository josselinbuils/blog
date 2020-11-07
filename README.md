# blog

## Run dev container

```bash
docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q) && docker build --tag blog:latest . && docker run --env HTTP_PREFIX=/blog --publish 3000:3000 --detach --name blog blog:latest
```
