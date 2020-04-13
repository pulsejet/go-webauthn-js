"use strict";
var path = require('path');
// Declare for loading
var WebAuthnGoJS;
require(path.resolve(__dirname, './load'));
/** Initialize JS module and internal server */
function initialize(configuration, callback) {
    require(path.resolve(__dirname, './go-webauthn'));
    return WebAuthnGoJS.CreateContext(JSON.stringify(configuration), callback);
}
/** Start registration with WebAuthn */
function beginRegistration(user, callback) {
    if (!WebAuthnGoJS)
        callback('WebAuthn context not initialized', undefined);
    return WebAuthnGoJS.BeginRegistration(JSON.stringify(user), function (err, data) {
        callback(err, data ? JSON.parse(data) : null);
    });
}
/** Finish registration with WebAuthn */
function finishRegistration(user, registrationSessionData, registrationBody, callback) {
    if (!WebAuthnGoJS)
        callback('WebAuthn context not initialized', undefined);
    return WebAuthnGoJS.FinishRegistration(JSON.stringify(user), JSON.stringify(registrationSessionData), JSON.stringify(registrationBody), function (err, data) { return callback(err, data ? JSON.parse(data) : null); });
}
/** Start authentication with WebAuthn */
function beginLogin(user, callback) {
    if (!WebAuthnGoJS)
        callback('WebAuthn context not initialized', undefined);
    return WebAuthnGoJS.BeginLogin(JSON.stringify(user), function (err, data) { return callback(err, data ? JSON.parse(data) : null); });
}
/** Finish authentication with WebAuthn */
function finishLogin(user, authenticationSessionData, authenticationBody, callback) {
    if (!WebAuthnGoJS)
        callback('WebAuthn context not initialized', undefined);
    return WebAuthnGoJS.FinishLogin(JSON.stringify(user), JSON.stringify(authenticationSessionData), JSON.stringify(authenticationBody), callback);
}
module.exports = {
    initialize: initialize,
    beginRegistration: beginRegistration, finishRegistration: finishRegistration,
    beginLogin: beginLogin, finishLogin: finishLogin,
};
