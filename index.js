const path = require('path');
const fs = require('fs');

require(path.resolve(__dirname, './wasm_exec'));

/** Initialize WASM module and internal server */
function initialize(configuration, callback) {
    const go = new Go();
    WebAssembly.instantiate(fs.readFileSync(path.resolve(__dirname, './main.wasm')), go.importObject).then((result) => {
        go.run(result.instance);
        WebAuthnGoWASM.CreateContext(JSON.stringify(configuration), callback);
    }).catch((err) => {
        callback(err, null);
    });
    return go;
}

/** Start registration with WebAuthn */
function beginRegistration(user, callback) {
    return WebAuthnGoWASM.BeginRegistration(
        JSON.stringify(user),
        (err, data) => callback(err, JSON.parse(data))
    );
}

/** Finish registration with WebAuthn */
function finishRegistration(user, registrationSessionData, registrationBody, callback) {
    return WebAuthnGoWASM.FinishRegistration(
        JSON.stringify(user),
        JSON.stringify(registrationSessionData),
        JSON.stringify(registrationBody),
        (err, data) => callback(err, JSON.parse(data))
    );
}

/** Start authentication with WebAuthn */
function beginLogin(user, callback) {
    return WebAuthnGoWASM.BeginLogin(
        JSON.stringify(user),
        (err, data) => callback(err, JSON.parse(data))
    );
}

/** Finish authentication with WebAuthn */
function finishLogin(user, authenticationSessionData, authenticationBody, callback) {
    return WebAuthnGoWASM.FinishLogin(
        JSON.stringify(user),
        JSON.stringify(authenticationSessionData),
        JSON.stringify(authenticationBody),
        (err, data) => callback(err, data)
    );
}

module.exports = {
    initialize,
    beginRegistration, finishRegistration,
    beginLogin, finishLogin,
}
