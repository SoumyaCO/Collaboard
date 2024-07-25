# using docker container (from cli): no `comnpose.yml` file required
# 1. mongodb-create: for creating the container from the image (1st time)
mongodb-create:
	export MONGODB_VERSION=6.0-ubi8 && \
	docker run --name mongodb -d -p 27017:27017 mongodb/mongodb-community-server:$MONGODB_VERSION 

# 2. mongodb-start: strating a stopped container (provided: you have to have a container: mongodb)
mongodb-start:
	docker start mongodb

# 3. mongodb-stop: stopping an already running container
mongodb-stop: 
	docker stop mongodb

# using docker compose 
# advantage: you can delete all of your containers in one command
# 1. container-create: create all the resources and run them in detach mode (keep cli free)
container-create:
	docker compose up -d

# 2. container-delete: delete all the container created due to `docker compose up`
container-delete:
	docker compose down

# 3. container-start: starts a docker container group (in this case jsut the container)
# provided: they have not been deleted by the command `docker compose down`
container-start:
	docker compose start

# 4. stop a running container-group (in this case just the mongodb), instead of destroying...
# the containers with `docker compose down` command
container-stop:
	docker compose stop