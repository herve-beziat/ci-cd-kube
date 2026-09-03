.PHONY: help install lint test dev docker-build docker-run break-test fix-test demo-failure demo-fix

help:
	@echo "Available targets:"
	@echo "  install       Install dependencies (npm ci)"
	@echo "  lint          Run eslint"
	@echo "  test          Run tests with coverage"
	@echo "  dev           Run the server locally, outside Electron"
	@echo "  docker-build  Build the Docker image (tag: pocketman)"
	@echo "  docker-run    Run the Docker image, mapped to port 3000"
	@echo "  break-test    Break a test locally (for demo purposes)"
	@echo "  fix-test      Restore the test broken by break-test"
	@echo "  demo-failure  Break a test, commit, push, and trigger the pipeline"
	@echo "  demo-fix      Restore the test, commit, and push"

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

break-test:
	sed -i 's/toBe(true)/toBe(false)/' tests/unit/server.smoke.test.js

fix-test:
	sed -i 's/toBe(false)/toBe(true)/' tests/unit/server.smoke.test.js

demo-failure: break-test
	git commit -am "test: temporarily break a test to demo pipeline failure"
	git push
	gh workflow run ci-main.yml --ref $$(git branch --show-current)
	@echo "Triggered. Check the Actions tab or Google Chat for the result."

demo-fix: fix-test
	git commit -am "revert: restore test after failure demo"
	git push
