.PHONY: clean build_image run_docker

IMAGE_NAME="prototype/node-web-app"

all: run_docker

build_image: build_app
	docker build -t $(IMAGE_NAME) .

build_app:
	npm install
	npm build

run_docker: build_image
	docker run -p 8080:8080 -d $(IMAGE_NAME)

clean:
	@echo "TODO"
