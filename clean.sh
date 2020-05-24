#!/usr/bin/env bash

rm -rf node_modules/

rm -rf bacnet/

rm -rf code/

rm -rf coverage/

rm package-lock.json

npm cache verify

npm install

npm i --only=dev

npm test

npm run build

npm run rewrite-changelog
