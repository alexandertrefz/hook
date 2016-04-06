#! /bin/bash
node_modules/.bin/rollup src/hook.ts -o dist/hook.amd.js -c -f amd
node_modules/.bin/rollup src/hook.ts -o dist/hook.cjs.js -c -f cjs
node_modules/.bin/rollup src/hook.ts -o dist/hook.umd.js -c -f umd
node_modules/.bin/rollup src/hook.ts -o dist/hook.iife.js -c -f iife
node_modules/.bin/rollup src/hook.ts -o dist/hook.es6.js -c rollup.es6.config.js -f es6
