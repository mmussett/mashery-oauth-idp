var soapClient = require('soap');
var restClient = require('node-rest-client').Client;
const util = require('util');

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

        if (response.statusCode == 401) {
            errorCallback(Error('Not Authorized'));
        }else {
            console.log(util.inspect(data, false, null));
            successCallback(data);
        }
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



async function authenticate(username, password) {

    var result = false;

    try {

        var authArgs = {
            username: username,
            password: password
        };
        const authResult = await authApiCallWrapper(authArgs);

        result = authResult;

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
