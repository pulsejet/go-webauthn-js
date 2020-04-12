# Go-WebAuthn-JS

A go webauthn server library compiled to target WASM. You can run a webauthn server-client in the browser with this!

Uses [duo-labs/webauthn](https://github.com/duo-labs/webauthn) as the primary library, and borrows heavily from the [webauthn example](https://github.com/hbolimovsky/webauthn-example).

## Usage
See index.html for an example. You may similarly run the server in node, with
```
npm i go-webauthn-js
```
Note that this is might be slow, broken and non-performant. Don't use it unless you know what you're doing.

## Compiling
You will need Go 1.14+ to compile to WASM
```
GOOS=js GOARCH=WASM go build -o main.wasm
```
