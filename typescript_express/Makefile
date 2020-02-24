.PHONY: clean docker_build docker_build_image docker_run docker_run_image
.PHONY: docker_build_fallback

DOCKER_FILE_BUILD=./docker/build/Dockerfile
DOCKER_FILE_RUN=./docker/run/Dockerfile

DOCKER_IMAGE_NAME_BUILD=prototype/typescript-express-build
DOCKER_IMAGE_NAME_RUN=prototype/typescript-express-run

DOCKER_IMAGE_BUILD_FILE_NAME=docker-image-typescript-express-build.tar
DOCKER_IMAGE_RUN_FILE_NAME=docker-image-typescript-express-run.tar

DOCKER_ARGS_BUILD=#--no-cache
DOCKER_ARGS_RUN_IMAGE_RUN=-d \
                          -p 8080:8080

SERVER_PORT=8080

all: docker_build docker_run

docker_build_image:
	docker build $(DOCKER_ARGS_BUILD) -t $(DOCKER_IMAGE_NAME_BUILD) -f $(DOCKER_FILE_BUILD) .

docker_build: docker_build_image
	docker rm -f temp
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
	rm -f .env .env.docker docs/todos.md

dev:
	export NODE_ENV="development"; \
	npm install
	npm run dev

build:
	rm -rf dist node_modules
	export NODE_ENV="development"; \
	npm install
	export NODE_ENV="production"; \
	npm run build
	rm -rf node_modules
	export NODE_ENV="production"; \
	npm install --only=prod

run:
	npm run start
