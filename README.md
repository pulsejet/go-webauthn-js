# Go-WebAuthn-JS

A go webauthn server library compiled with GopherJS. You can run a webauthn server-client in the browser with this!

Uses [my fork of duo-labs/webauthn](https://github.com/pulsejet/webauthn) as the primary library, removing some features to trim down the size and replacing libraries with slimmer ones, and borrows heavily from the [webauthn example](https://github.com/hbolimovsky/webauthn-example).

## Usage
See index.html for an example. You may similarly run the server in node, with
```
npm i go-webauthn-js
```
Note that this is might be slow, broken and non-performant. Don't use it unless you know what you're doing.

## Compiling
Compile with gopherjs, and optionally minify with the closure compiler
```
gopherjs build -o go-webauthn.js
java -jar ./closure.jar --js ./go-webauthn.js --js_output_file go-webauthn.min.js
```

## WASM Target
The project initially targeted WASM. You will need Go 1.14+ to compile.
```
GOOS=js GOARCH=WASM go build -o main.wasm
```
