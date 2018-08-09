var crypto = require('crypto');
var https = require('https');
var props = require('../properties.js');


var idCount = 1;


function createSignature() {

    var md5sum = crypto.createHash('md5');
    var timestamp = Math.floor(Date.now() / 1000);
    var sig = md5sum.update(props.mashApiKey + props.mashApiSecret
        + timestamp).digest('hex');

    return sig;
}

function mashlocalApiCall(req, callback) {


    var uriConstructed =  props.mashApiPath + '/' + props.mashAreaId + "?apikey="
        + props.mashApiKey + "&sig=" + createSignature();

    var options = {
        hostname: props.mashlocalApiHost,
        port: props.mashlocalApiPort,
        method: 'POST',
        path: uriConstructed,
        headers: {
            'Content-Length': JSON.stringify(req).length
        },
        auth: {
            user: props.mashlocalApiUsername,
            pass: props.mashlocalApiPassword
        }
    };

    var postReq = https.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
            console.log("\n##### Response from Mashery API #####");
            console.log(JSON.stringify(data,null, 2));
        });
        res.on('end', function () {
            callback(JSON.parse(data));
        });
    });


    console.log('Request data to Mashery API');
    console.log(JSON.stringify(req));

    postReq.write(JSON.stringify(req));
    postReq.end();


}

function mashApiCall(req, callback) {


    var uriConstructed = props.mashApiPath + '/' + props.mashAreaId + "?apikey="
        + props.mashApiKey + "&sig=" + createSignature();

    var options = {
        hostname: props.mashApiHost,
        port: props.mashApiPort,
        method: 'POST',
        path: uriConstructed,
        headers: {
            'Content-Length': JSON.stringify(req).length
        }
    };

    var postReq = https.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
            console.log("\n##### Response from Mashery API #####");
            console.log(JSON.stringify(data,null, 2));
        });
        res.on('end', function () {
            callback(JSON.parse(data));
        });
    });


    console.log('Request data to Mashery API');
    console.log(JSON.stringify(req));

    postReq.write(JSON.stringify(req));
    postReq.end();


}

exports.fetchApplication = function (mashServiceKey, mashClientId, redirectUri, state, responseType, callback) {

    console.log('BEGIN fetchApplication()');

    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.fetchApplication",
        "params": {
            "service_key": mashServiceKey,
            "client": {
                "client_id": mashClientId
            },
            "uri": {"redirect_uri": redirectUri, "state": state},
            "response_type": responseType
        },
        id: idCount++
    };


    mashApiCall(req, callback);

    console.log('END fetchApplication()');

}

exports.createAuthorizationCode = function (mashServiceKey, mashClientId, redirectUri, scope, userContext, callback) {


    console.log('BEGIN createAuthorizationCode()');


    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.createAuthorizationCode",
        "params": {
            "service_key": mashServiceKey,
            "client": {
                "client_id": mashClientId
            },
            "uri": {
                "redirect_uri": redirectUri
            },
            "scope": scope,
            "user_context": userContext,
            "response_type": "code"
        },
        "id": idCount++
    };

    mashApiCall(req, callback);

    console.log('END createAuthorizationCode()');
}
// Limit on userContext is 255 characters
// Limit on scope is 1024 characters
exports.createAccessToken = function (grantType, mashServiceKey, mashClientId, redirectUri, scope, userContext, mashClientSecret, authCode, callback) {

    console.log('BEGIN createAccessToken()');

    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.createAccessToken",
        "params": {
            "service_key": mashServiceKey,
            "client": {
                "client_id": mashClientId
            },
            "token_data": {
                "grant_type": grantType,
            },
            "uri": {}
        },
        "id": idCount++
    };

    switch (grantType) {
        case 'authorization_code':
            req.params.client.client_secret = mashClientSecret;
            req.params.token_data.code = authCode;
            if (redirectUri)
                req.params.uri.redirect_uri = redirectUri;
            break;
        case 'implicit':
            req.params.token_data.scope = scope;
            req.params.uri.redirect_uri = redirectUri;
            req.params.user_context = userContext;
            break;
        case 'password':
            req.params.client.client_secret = mashClientSecret;
            req.params.user_context = userContext;
            if (scope)
                req.params.token_data.scope = scope;
            break;
        case 'client_credentials':
            req.params.client.client_secret = mashClientSecret;
            if (scope)
                req.params.token_data.scope = scope;
            break;
        case 'refresh_token':
            req.params.client.client_secret = mashClientSecret;
            req.params.token_data.refresh_token = authCode;
            if (scope)
                req.params.token_data.scope = scope;
            break;
    }

    mashApiCall(req, callback);

    console.log('END createAccessToken()');
}

exports.fetchAccessToken = function (mashServiceKey, accessToken, callback) {

    console.log('BEGIN fetchAccessToken()');

    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.fetchAccessToken",
        "params": {
            "service_key": mashServiceKey,
            "access_token": accessToken
        },
        "id": idCount++
    };

    mashApiCall(req, callback);

    console.log('END fetchAccessToken()');

}

exports.fetchUserApplications = function (mashServiceKey, userContext, callback) {

    console.log('BEGIN fetchUserApplications()');

    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.fetchUserApplications",
        "params": {
            "service_key": mashServiceKey,
            "user_context": userContext
        },
        "id": idCount++
    };

    mashApiCall(req, callback);

    console.log('END fetchUserApplications()');
}

exports.revokeAccessToken = function (mashServiceKey, clientId, accessToken, callback) {

    console.log('BEGIN revokeAccessToken()');

    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.revokeAccessToken",
        "params": {
            "service_key": mashServiceKey,
            "client": {"client_id": clientId},
            "access_token": accessToken
        },
        "id": idCount++
    };

    mashApiCall(req, callback);

    console.log('END revokeAccessToken()');
}

exports.revokeUserApplication = function (mashServiceKey, clientId, userContext, callback) {

    console.log('BEGIN revokeUserApplication()');
    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.revokeUserApplication",
        "params": {
            "service_key": mashServiceKey,
            "client": {"client_id": clientId},
            "user_context": userContext
        },
        "id": idCount++
    };

    mashApiCall(req, callback);

    console.log('END revokeUserApplication()');
}

exports.updateAccessToken = function (mashServiceKey, clientId, clientSecret, accessToken, expiresIn, callback) {

    console.log('BEGIN updateAccessToken()');
    var req = {
        "jsonrpc": "2.0",
        "method": "oauth2.updateAccessToken",
        "params": {
            "service_key": mashServiceKey,
            "client": {"client_id": clientId, "client_secret": clientSecret},
            "access_token": accessToken,
            "expires_in": parseInt(expiresIn)
        },
        "id": idCount++
    };

    mashApiCall(req, callback);

    console.log('END updateAccessToken()');
}
