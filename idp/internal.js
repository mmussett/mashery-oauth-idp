var soapClient = require('soap');
var restClient = require('node-rest-client').Client;

var sambaLoginHost = '10.0.0.5';
var sambaLoginPort = 8080;
var sambaLoginUrl = '/login';

function desmonApiCall(args, successCallback, errorCallback){


    var args = {in:args.token};

    soapClient.createClient(__dirname + '/../wsdl/desmon.wsdl', function (err, client) {
        if(err) {
            errorCallback(err);
        } else {
            client.Authenticate(args, function(err, response) {


                if(err) {
                    errorCallback(err);
                } else {
                    successCallback(response);
                }
            });
        }
    });


}


function sambaApiCall(args, successCallback, errorCallback) {

    var client = new restClient();

    var opts = {
        data: { username: args.username, password: args.password},
        headers: {
            "Content-Type": "application/json",
            "X-Desmon-Certificate": args.cert
        }
    };

    var req = client.post("http://10.0.0.5:8080/login", opts, function(data, response) {
        console.log("\n##### Response from SAMBA API #####");
        console.log("SAMBA Response Status Code: " + response.statusCode)
        console.log("SAMBA Data: "+ data);

        successCallback(data);
    });


    req.on('requestTimeout', function (req) {
        console.log('request has expired');
        req.abort();
        errorCallback(Error('Request Timeout'));
    });

    req.on('responseTimeout', function (res) {
        console.log('response has expired');
        errorCallback(Error('Response Timeout'));

    });

    req.on('error', function (err) {
        console.log('request error', err);
        errorCallback(err);
    });


}

function authApiCall(args, successCallback, errorCallback) {

    var client = new restClient();

    var opts = {
        data: { username: args.username, password: args.password},
        headers: {
            "Content-Type": "application/json",
        }
    };

    var req = client.post("http://35.159.8.83:8090/authenticate", opts, function(data, response) {
        console.log("\n##### Response from Auth Proxy API #####");
        console.log("Auth Proxy Response Status Code: " + response.statusCode)
        console.log("Auth Proxy Data: "+ data);

        successCallback(data);
    });


    req.on('requestTimeout', function (req) {
        console.log('request has expired');
        req.abort();
        errorCallback(Error('Request Timeout'));
    });

    req.on('responseTimeout', function (res) {
        console.log('response has expired');
        errorCallback(Error('Response Timeout'));

    });

    req.on('error', function (err) {
        console.log('request error', err);
        errorCallback(err);
    });


}

function authApiCallWrapper(args) {
    return new Promise((resolve, reject) => {
        authApiCall(args, (successResponse) => { resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse)
        });
    });
}

function sambaApiCallWrapper(args) {
    return new Promise((resolve, reject) => {
        sambaApiCall(args, (successResponse) => { resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse)
        });
    });
}

function desmonApiCallWrapper(args) {
    return new Promise((resolve, reject) => {
        desmonApiCall(args, (successResponse) => { resolve(successResponse);
        }, (errorResponse) => {
            reject(errorResponse)
        });
    });
}

async function authenticateOld(username, password) {

    var result = false;

    try {
        var desmonArgs = {token: "token"};
        const cert = await desmonApiCallWrapper(desmonArgs)

        var sambaArgs = {
            username: username,
            password: password,
            cert: cert.out
        };

        const sambaResult = await sambaApiCallWrapper(sambaArgs);

        if (sambaResult == "OK") {
            result = true;
        } else {
            result = false;
        }
        console.log('SAMBA returned: ' + sambaResult);

    } catch(error) {
        console.log(error);
        return result;
    }

    return result;

}

async function authenticate(username, password) {

    var result = false;

    try {

        var authArgs = {
            username: username,
            password: password
        };
        const authResult = await authApiCallWrapper(authArgs);

        console.log(authResult)
        if (authResult == "OK") {
            result = true;
        } else {
            result = false;
        }
        console.log('Auth Proxy returned: ' + sambaResult);

    } catch(error) {
        console.log(error);
        return result;
    }

    return result;

}



exports.verifyCredentials = function(username, password, callback) {

    let result = authenticate(username, password);

    result.then(function(result){
        if (result) {
            console.log("Credentials verification: OK");
        } else {
            console.log("Credentials verification: FAIL");
        }
        console.debug(result);
        callback(result);
    });

}
