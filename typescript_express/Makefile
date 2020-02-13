.PHONY: clean docker_build docker_build_image docker_run docker_run_image
.PHONY: docker_build_fallback

DOCKER_FILE_BUILD=./docker/build/Dockerfile
DOCKER_FILE_RUN=./docker/run/Dockerfile

DOCKER_IMAGE_NAME_BUILD="prototype/typescript-express-build"
DOCKER_IMAGE_NAME_RUN="prototype/typescript-express-run"

DOCKER_ARGS=--no-cache

SERVER_PORT=8080

all: docker_build docker_run

fallback: docker_build_fallback docker_run

docker_build_image:
	docker build $(DOCKER_ARGS) -t $(DOCKER_IMAGE_NAME_BUILD) -f $(DOCKER_FILE_BUILD) .
	# TODO: Run successful

docker_build: docker_build_image
	docker run -d $(DOCKER_IMAGE_NAME_BUILD)
	TODO: Extract built files

# FALLBACK
docker_build_fallback:
	npm install
	export NODE_ENV="production"; \
	npm run build
# FALLBACK

docker_run_image:
	if [[ ! -e .env.docker ]]; then \
		cp ".env.sample" ".env.docker"; \
	fi
	docker build $(DOCKER_ARGS) -t $(DOCKER_IMAGE_NAME_RUN) -f $(DOCKER_FILE_RUN) .

docker_run: docker_run_image
	docker run -p 8080:8080 -d $(DOCKER_IMAGE_NAME_RUN)

remove_all_stopped_docker_containers:
	docker container prune -f

clean:
	rm -rf dist node_modules docs/site
	rm -f .env .env.docker docs/todos.md

dev:
	npm install
	npm run dev

build:
	npm install
	npm run build
