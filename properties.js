// The mash prefixed properties are required for server side communication
// with the Mashery Platform APIs
//
// mashAreaId - Your area ID
// mashApiKey - Your API Key for the Mashery Platform API
// mashApiSecret - Your API Secret for the Mashery Platform API
// mashApiHost - Mashery Platform API hostname
// mashApiPort - Mashery Platform API port
// mashApiPath - Mashery Platform API path

// The oauth prefixed properties are the URIs for this app, which can be
// customized here. If not specified, a default will be used
//
// oauthServerAuthUri - The OAuth Auth Endpoint (default: /oauth/v2/auth)
// oauthServerTokenUri - The OAuth Token Endpoint (default: /oauth/v2/token)
// oauthTokenTesterUri - The Client Tester (default: /client/tester)
// oauthTokenStatusUri - The User Managed Token Access (default: /client/status)

// The client prefixed properties are for the tokenTester and tokenStatus
// test tools. They are all optional parameters.
//
// clientServiceKey - (optional) The service key parameter sent by the client
// clientApiKey - (optional) The client's API Key / client_id
// clientApiSecret - (optional) The client's API Secret / client_secret

var props = {
	mashAreaId: '1201',
	mashApiKey: '7rn8vgpty6nywruhgc755qh6',
	mashApiSecret: '2q34GBG3nx',
	mashApiHost: 'api.mashery.com',
	mashApiPort: 443,
	mashApiPath: '/v2/json-rpc',
	oauthServerAuthUri: '/oauth/v2/auth',
	oauthServerTokenUri: '/oauth/v2/token',
	oauthTokenTesterUri: '/client/tester',
	oauthTokenStatusUri: '/client/status',
	clientServiceKey: '3qfm26jub8uscy6jygqrp6pm',
	clientApiKey: 'sabs3m29h4gccfxdpqvcnx4j',
	clientApiSecret: '4gbXPw7YTV',
}

// Do not change anything below this line

if (!props.oauthServerAuthUri) props.oauthServerAuthUri = '/outh/v2/auth';
if (!props.oauthServerTokenUri) props.oauthServerTokenUri = '/outh/v2/token';
if (!props.oauthTokenTesterUri) props.oauthTokenTesterUri = '/client/tester';
if (!props.tokenStatusUri) props.tokenStatusUri = '/client/status';

module.exports = props;
