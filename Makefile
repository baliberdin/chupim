.PHONY: install build typecheck test clean

install:
	npm ci

build:
	npm run build

typecheck:
	npm run typecheck

test: typecheck
	npm test

clean:
	rm -rf dist coverage
