package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"

	"syscall/js"

	"github.com/duo-labs/webauthn/protocol"
	"github.com/duo-labs/webauthn/webauthn"
)

var webAuthn *webauthn.WebAuthn

func main() {
	exp := make(map[string]interface{})

	exp["CreateContext"] = js.FuncOf(createContext)
	exp["BeginRegistration"] = js.FuncOf(beginRegistration)
	exp["FinishRegistration"] = js.FuncOf(finishRegistration)
	exp["BeginLogin"] = js.FuncOf(beginLogin)
	exp["FinishLogin"] = js.FuncOf(finishLogin)

	// Export globally to JS
	js.Global().Set("WebAuthnGoWASM", exp)
}

// createContext creates a new webauthn instance from the config
func createContext(this js.Value, inputs []js.Value) interface{} {
	var err error
	callback := inputs[len(inputs)-1:][0]

	var config webauthn.Config
	err = json.Unmarshal([]byte(inputs[0].String()), &config)
	if err != nil {
		callback.Invoke("Failed to parse configuration"+err.Error(), js.Null())
		return js.Null()
	}

	webAuthn, err = webauthn.New(&config)
	if err != nil {
		callback.Invoke("Failed to create WebAuthn from config:"+err.Error(), js.Null())
		return js.Null()
	}

	callback.Invoke(js.Null(), "Context created successfully")
	return js.Null()
}

// beginRegistration gets an object to pass to user registration
func beginRegistration(this js.Value, inputs []js.Value) interface{} {
	// Get parameters
	userStr := inputs[0].String()
	callback := inputs[len(inputs)-1:][0]

	// Check if we have context first!
	if webAuthn == nil {
		callback.Invoke("Context not initialized!", js.Null())
		return js.Null()
	}

	// Parse the user
	var user User
	err := json.Unmarshal([]byte(userStr), &user)
	if err != nil {
		callback.Invoke("Failed to parse user: "+err.Error(), js.Null())
		return js.Null()
	}

	registerOptions := func(credCreationOpts *protocol.PublicKeyCredentialCreationOptions) {
		credCreationOpts.CredentialExcludeList = user.CredentialExcludeList()
	}

	// generate PublicKeyCredentialCreationOptions, session data
	options, sessionData, err := webAuthn.BeginRegistration(
		user,
		registerOptions,
	)
	if err != nil {
		callback.Invoke(err.Error(), js.Null())
		return js.Null()
	}

	// create response to send
	response := make(map[string]interface{})
	response["registrationSessionData"] = sessionData
	response["credentialCreationOptions"] = options

	callback.Invoke(js.Null(), responseJS(response))
	return js.Null()
}

// finishRegistration completes the registration process
func finishRegistration(this js.Value, inputs []js.Value) interface{} {
	// Get parameters
	userStr := inputs[0].String()
	registrationSessionDataStr := inputs[1].String()
	body := inputs[2].String()
	callback := inputs[len(inputs)-1:][0]

	// Check if we have context first!
	if webAuthn == nil {
		callback.Invoke("Context not initialized!", js.Null())
		return js.Null()
	}

	var user User
	err := json.Unmarshal([]byte(userStr), &user)
	if err != nil {
		callback.Invoke("Failed to parse user: "+err.Error(), js.Null())
		return js.Null()
	}

	sessionData := webauthn.SessionData{}
	err = json.Unmarshal([]byte(registrationSessionDataStr), &sessionData)
	if err != nil {
		callback.Invoke(err.Error(), js.Null())
		return js.Null()
	}

	r := protocol.Request{}
	r.Body = ioutil.NopCloser(bytes.NewReader([]byte(body)))
	credential, err := webAuthn.FinishRegistration(user, sessionData, &r)
	if err != nil {
		callback.Invoke(err.Error(), js.Null())
		return js.Null()
	}

	callback.Invoke(js.Null(), responseJS(*credential))
	return js.Null()
}

// beginLogin starts the login process
func beginLogin(this js.Value, inputs []js.Value) interface{} {
	// Get parameters
	userStr := inputs[0].String()
	callback := inputs[len(inputs)-1:][0]

	// Check if we have context first!
	if webAuthn == nil {
		callback.Invoke("Context not initialized!", js.Null())
		return js.Null()
	}

	// parse user
	var user User
	err := json.Unmarshal([]byte(userStr), &user)
	if err != nil {
		callback.Invoke("Failed to parse user: "+err.Error(), js.Null())
		return js.Null()
	}

	// generate PublicKeyCredentialRequestOptions, session data
	options, sessionData, err := webAuthn.BeginLogin(user)
	if err != nil {
		callback.Invoke(err.Error(), js.Null())
		return js.Null()
	}

	// create response to send
	response := make(map[string]interface{})
	response["authenticationSessionData"] = sessionData
	response["credentialRequestOptions"] = options

	callback.Invoke(js.Null(), responseJS(response))
	return js.Null()
}

// finishLogin completes the login process
func finishLogin(this js.Value, inputs []js.Value) interface{} {
	// Get parameters
	userStr := inputs[0].String()
	authenticationSessionDataStr := inputs[1].String()
	body := inputs[2].String()
	callback := inputs[len(inputs)-1:][0]

	// Check if we have context first!
	if webAuthn == nil {
		callback.Invoke("Context not initialized!", js.Null())
		return js.Null()
	}

	// parse user
	var user User
	err := json.Unmarshal([]byte(userStr), &user)
	if err != nil {
		callback.Invoke("Failed to parse user: "+err.Error(), js.Null())
		return js.Null()
	}

	// load the session data
	sessionData := webauthn.SessionData{}
	err = json.Unmarshal([]byte(authenticationSessionDataStr), &sessionData)
	if err != nil {
		callback.Invoke(err.Error(), js.Null())
		return js.Null()
	}

	// TODO: perform additional checks on the returned 'credential',
	// i.e. check 'credential.Authenticator.CloneWarning'
	// and then increment the credentials counter
	r := protocol.Request{}
	r.Body = ioutil.NopCloser(bytes.NewReader([]byte(body)))
	_, err = webAuthn.FinishLogin(user, sessionData, &r)
	if err != nil {
		callback.Invoke(err.Error(), js.Null())
		return js.Null()
	}

	callback.Invoke(js.Null(), "Login Success")
	return js.Null()
}

func responseJS(d interface{}) string {
	dj, err := json.Marshal(d)
	if err != nil {
		return "{}"
	}
	return string(dj)
}
