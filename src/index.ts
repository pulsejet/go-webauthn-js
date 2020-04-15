const path = require('path');

// Typings for WebAuthnGoJS
export type CreateContextCallback = (err?: string, success?: string) => void;
export type BeginRegistrationCallback = (err?: string, data?: {
    registrationSessionData: any,
    credentialCreationOptions: CredentialCreationOptions,
}) => void;
export type FinishRegistrationCallback = (err?: string, credential?: Credential) => void;
export type BeginLoginCallback = (err?: string, data?: {
    authenticationSessionData: any,
    credentialRequestOptions: CredentialRequestOptions,
}) => void;
export type FinishLoginCallback = (err?: string, credential?: Credential) => void;

// Device authenticating
export type Authenticator = {
	AAGUID: string;
	SignCount: number;
	CloneWarning: boolean;
}

// Credential to store
export type Credential = {
	ID: string;
	PublicKey: string;
	AttestationType: string;
	Authenticator: Authenticator;
}

// POSTed objects
export type RegistrationBody = {
    id: string,
    rawId: string,
    type: string,
    response: {
        attestationObject: string,
        clientDataJSON: string,
    },
}

export type AuthenticationBody = {
    id: string,
    rawId: string,
    type: string,
    response: {
        authenticatorData: string,
        clientDataJSON: string,
        signature: string,
        userHandle: string,
    },
}

// Callback from Go
type GoCallback = (err?: string, data?: string) => void;

// Interface exposed by go
type WebAuthnGoJSI = {
    CreateContext: (config: string, callback: GoCallback) => void,
    BeginRegistration: (user: string, callback: GoCallback) => void,
    FinishRegistration: (user: string, sessData: string, body: string, callback: GoCallback) => void,
    BeginLogin: (user: string, callback: GoCallback) => void,
    FinishLogin: (user: string, sessData: string, body: string, callback: GoCallback) => void,
}

export type AuthenticatorSelection = {
	authenticatorAttachment?: AuthenticatorAttachment;
	requireResidentKey?: boolean;
	userVerification?: UserVerificationRequirement;
}

/** Configuration for the WebAuthn server */
export type Config = {
    RPDisplayName: string;
    RPID: string;
    RPOrigin: string;
    RPIcon?: string;

    AttestationPreference?: AttestationConveyancePreference;
    AuthenticatorSelection?: AuthenticatorSelection;

    Timeout?: number;
    Debug?: boolean;
}

/** User represents the user model  */
export type User = {
	id: number;
	name: string;
	displayName: string;
	credentials: any[];
}

// Declare for loading
var WebAuthnGoJS: WebAuthnGoJSI;
require(path.resolve(__dirname, './load'));

/** Initialize JS module and internal server */
export function initialize(configuration: Config, callback: CreateContextCallback): void {
    require(path.resolve(__dirname, './go-webauthn'));
    if (!WebAuthnGoJS) WebAuthnGoJS = (global as any).WebAuthnGoJS;

    return WebAuthnGoJS.CreateContext(JSON.stringify(configuration), callback);
}

/** Start registration with WebAuthn */
export function beginRegistration(
    user: User,
    callback: BeginRegistrationCallback
): void {
    if (!WebAuthnGoJS) callback('WebAuthn context not initialized', undefined);

    return WebAuthnGoJS.BeginRegistration(
        JSON.stringify(user),
        (err?: string, data?: any): void => {
            callback(err, data ? JSON.parse(data) : null)
        }
    );
}

/** Finish registration with WebAuthn */
export function finishRegistration(
    user: User,
    registrationSessionData: any,
    registrationBody: RegistrationBody,
    callback: FinishRegistrationCallback
): void {
    if (!WebAuthnGoJS) callback('WebAuthn context not initialized', undefined);

    return WebAuthnGoJS.FinishRegistration(
        JSON.stringify(user),
        JSON.stringify(registrationSessionData),
        JSON.stringify(registrationBody),
        (err, data) => callback(err, data ? JSON.parse(data) : null)
    );
}

/** Start authentication with WebAuthn */
export function beginLogin(
    user: User,
    callback: BeginLoginCallback,
): void {
    if (!WebAuthnGoJS) callback('WebAuthn context not initialized', undefined);

    return WebAuthnGoJS.BeginLogin(
        JSON.stringify(user),
        (err, data) => callback(err, data ? JSON.parse(data) : null)
    );
}

/** Finish authentication with WebAuthn */
export function finishLogin(
    user: User,
    authenticationSessionData: any,
    authenticationBody: AuthenticationBody,
    callback: FinishRegistrationCallback,
): void {
    if (!WebAuthnGoJS) callback('WebAuthn context not initialized', undefined);

    return WebAuthnGoJS.FinishLogin(
        JSON.stringify(user),
        JSON.stringify(authenticationSessionData),
        JSON.stringify(authenticationBody),
        (err, data) => callback(err, data ? JSON.parse(data) : null)
    );
}
