var express = require('express');
var router = express.Router();
var mashApi = require('../lib/mashery-api-oauth.js');

var internalIdp = require('../idp/internal.js');

// Initial Request to the Authorization Endpoint
router.get('/:serviceKey', function (req, res, next) {

    var error = "";
    var applicationName = "";
    var disableForm = true;

    if (req.query.response_type && req.query.client_id)
        disableForm = false;

    mashApi.fetchApplication(req.params.serviceKey, req.query.client_id,
        req.query.redirect_uri, req.query.state, req.query.response_type,
        function (resp) {
            if (resp.error) {
                error = resp.error.message;
                disableForm = true;
            } else {
                applicationName = resp.result.name;
            }

            res.render('auth-endpoint', {
                title: 'Miles and More Auth Endpoint',
                baseUrl: req.baseUrl,
                path: req.originalUrl,
                responseType: req.query.response_type,
                clientId: req.query.client_id,
                redirectUri: req.query.redirect_uri,
                scope: req.query.scope,
                state: req.query.state,
                appName: applicationName,
                error: error,
                disableForm: disableForm,
            });
        });

});

// ##### This is when the form is POSTed to the OAuth Server
// ## There is no IDP configured here, so the username is used for
// ## user_context. You would inject an IDP in here if you wanted
// ## to validate the resource owner's credentials
// ## (req.body.username and req.body.password)

router.post('/:serviceKey', function (req, res, next) {


    var error = '';
    var authCode = true;

    console.log('Authorizing Application: ' + req.body.app_name + ' with Scope: ' + req.query.scope + ' for Username:' + req.body.username + ' with Password: ' + req.body.password);

    internalIdp.verifyCredentials(req.body.username, req.body.password, function (resp) {

        if(resp == false) {
            console.log('login failed. wrong username or password.');
            res.status(401).send('Not Authenticated');

        } else {


            if (req.query.response_type == 'token')
                authCode = false;

            if (authCode == true) {


                mashApi.createAuthorizationCode(req.params.serviceKey,
                    req.query.client_id, req.query.redirect_uri, req.query.scope,
                    req.body.username, function (resp) {
                        var error = '';
                        var code = '';
                        var redirectUri = '';

                        if (resp.error)
                            error = resp.error.message;
                        else {
                            code = resp.result.code;
                            redirectUri = resp.result.uri.redirect_uri;
                        }

                        res.render('auth-endpoint-post', {
                            title: 'Sample Auth Endpoint Confirmation',
                            authCode: authCode,
                            appName: req.body.app_name,
                            username: req.body.username,
                            error: error,
                            code: code,
                            accessToken: '',
                            tokenType: '',
                            expiresIn: '',
                            redirectUri: redirectUri,
                        });
                    });

            } else {
                mashApi.createAccessToken('implicit', req.params.serviceKey,
                    req.query.client_id, req.query.redirect_uri, req.query.scope,
                    req.body.username, null, null, function (resp) {
                        var error = '';
                        var accessToken = '';
                        var tokenType = '';
                        var expiresIn = '';
                        var redirectUri = req.query.redirect_uri + '#';

                        if (resp.error)
                            error = resp.error.message;
                        else {
                            accessToken = resp.result.access_token;
                            tokenType = resp.result.token_type;
                            expiresIn = resp.result.expires_in;
                            redirectUri += 'access_token=' + accessToken + '&state='
                                + req.query.state + '&token_type=' + tokenType
                                + '&expires_in=' + expiresIn;
                        }

                        res.render('auth-endpoint-post', {
                            title: 'Sample Auth Endpoint Confirmation',
                            authCode: authCode,
                            appName: req.body.app_name,
                            username: req.body.username,
                            error: error,
                            code: '',
                            accessToken: accessToken,
                            tokenType: tokenType,
                            expiresIn: expiresIn,
                            redirectUri: redirectUri,
                        });
                    });
            }

        }
    });
});

router.get('/cancel', function (req, res, next) {
    res.render('auth-endpoint-cancel', {
        title: 'Sample Auth Endpoint Cancel'
    });
});

module.exports = router;
