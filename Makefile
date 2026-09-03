.PHONY: help install lint test dev docker-build docker-run

help:
	@echo "Available targets:"
	@echo "  install       Install dependencies (npm ci)"
	@echo "  lint          Run eslint"
	@echo "  test          Run tests with coverage"
	@echo "  dev           Run the server locally, outside Electron"
	@echo "  docker-build  Build the Docker image (tag: pocketman)"
	@echo "  docker-run    Run the Docker image, mapped to port 3000"

install:
	npm ci

lint:
	npm run lint

test:
	npm run test:coverage

dev:
	node server.js

docker-build:
	docker build -t pocketman .

docker-run:
	docker run --rm -p 3000:3000 pocketman
