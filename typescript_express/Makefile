.PHONY: clean build_image run_docker

IMAGE_NAME="prototype/typescript-express"

all: run_docker

build_image: build_app
	echo "SERVER_PORT=8080" > .env.docker
	docker build --no-cache -t $(IMAGE_NAME) .
	rm .env.docker

build_app:
	# TODO: Do these two steps in a Docker instance and then extract the dist directory from there
	npm install
	export NODE_ENV="production"; \
	npm run build

run_docker: build_image
	docker run -p 8080:8080 -d $(IMAGE_NAME)

clean:
	@echo "TODO"

remove_all_stopped_docker_containers:
	docker container prune -f
