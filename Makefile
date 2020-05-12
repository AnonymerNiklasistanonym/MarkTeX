.PHONY: clean docker_build docker_build_image docker_run docker_run_image docker_export_build docker_export_run remove_all_stopped_docker_containers

DOCKER_FILE_BUILD=./docker/build/Dockerfile
DOCKER_FILE_RUN=./docker/run/Dockerfile

DOCKER_IMAGE_NAME_BUILD=prototype/typescript-express-build
DOCKER_IMAGE_NAME_RUN=prototype/typescript-express-run

DOCKER_IMAGE_BUILD_FILE_NAME=docker-image-typescript-express-build.tar
DOCKER_IMAGE_RUN_FILE_NAME=docker-image-typescript-express-run.tar

DEFAULT_SERVER_PORT=8080
DEFAULT_DATABASE_DIR="$(HOME)/.marktex"
DOCKER_SERVER_PORT_MAPPING=$(DEFAULT_SERVER_PORT)

DOCKER_ARGS_BUILD=#--no-cache
DOCKER_ARGS_RUN_IMAGE_RUN_RUN_IN_BACKGROUND=
DOCKER_ARGS_RUN_IMAGE_RUN_LINK_CONTAINER_PORT_TO_LOCALHOST=-p $(DOCKER_SERVER_PORT_MAPPING):$(DEFAULT_SERVER_PORT)
DOCKER_ARGS_RUN_IMAGE_RUN_MOUNT_LOCAL_DATABASE_DIR=--mount src="$(DEFAULT_DATABASE_DIR)",target="/usr/src/app/.marktex",type=bind
DOCKER_ARGS_RUN_IMAGE_RUN=$(DOCKER_ARGS_RUN_IMAGE_RUN_RUN_IN_BACKGROUND) \
                          $(DOCKER_ARGS_RUN_IMAGE_RUN_LINK_CONTAINER_PORT_TO_LOCALHOST) \
                          $(DOCKER_ARGS_RUN_IMAGE_RUN_MOUNT_LOCAL_DATABASE_DIR)


all: docker_build docker_run

docker_build_image:
	docker build $(DOCKER_ARGS_BUILD) -t $(DOCKER_IMAGE_NAME_BUILD) -f $(DOCKER_FILE_BUILD) .

docker_build: docker_build_image
	docker rm -f temp || true
	docker run -ti --name temp $(DOCKER_IMAGE_NAME_BUILD)
	rm -rf dist
	docker cp temp:/usr/src/app/dist ./
	docker rm -f temp

docker_run_image:
	if [[ ! -e .env.docker ]]; then \
		cp ".env.sample" ".env.docker"; \
	fi
	docker build $(DOCKER_ARGS_BUILD) -t $(DOCKER_IMAGE_NAME_RUN) -f $(DOCKER_FILE_RUN) .

docker_run: docker_run_image
	mkdir -p "$(DEFAULT_DATABASE_DIR)"
	docker run $(DOCKER_ARGS_RUN_IMAGE_RUN) $(DOCKER_IMAGE_NAME_RUN)

docker_export_build: docker_build_image
	mkdir -p docker/dist
	docker save $(DOCKER_IMAGE_NAME_BUILD) > docker/dist/$(DOCKER_IMAGE_BUILD_FILE_NAME)
	# Load with `docker load < xyz.tar`

docker_export_run: docker_build docker_run_image
	mkdir -p docker/dist
	docker save $(DOCKER_IMAGE_NAME_RUN) > docker/dist/$(DOCKER_IMAGE_RUN_FILE_NAME)
	# Load with `docker load < xyz.tar`

remove_all_stopped_docker_containers:
	docker container prune -f

clean:
	rm -rf dist node_modules docs/site docker/dist .nyc_output coverage
	rm -f docs/todos.md
