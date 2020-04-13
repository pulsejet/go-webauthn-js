const path = require('path');

require(path.resolve(__dirname, './load'));

/** Initialize JS module and internal server */
function initialize(configuration, callback) {
    require(path.resolve(__dirname, './go-webauthn'));
    return WebAuthnGoJS.CreateContext(JSON.stringify(configuration), callback);
}

/** Start registration with WebAuthn */
function beginRegistration(user, callback) {
    return WebAuthnGoJS.BeginRegistration(
        JSON.stringify(user),
        (err, data) => callback(err, JSON.parse(data))
    );
}

/** Finish registration with WebAuthn */
function finishRegistration(user, registrationSessionData, registrationBody, callback) {
    return WebAuthnGoJS.FinishRegistration(
        JSON.stringify(user),
        JSON.stringify(registrationSessionData),
        JSON.stringify(registrationBody),
        (err, data) => callback(err, JSON.parse(data))
    );
}

/** Start authentication with WebAuthn */
function beginLogin(user, callback) {
    return WebAuthnGoJS.BeginLogin(
        JSON.stringify(user),
        (err, data) => callback(err, JSON.parse(data))
    );
}

/** Finish authentication with WebAuthn */
function finishLogin(user, authenticationSessionData, authenticationBody, callback) {
    return WebAuthnGoJS.FinishLogin(
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
