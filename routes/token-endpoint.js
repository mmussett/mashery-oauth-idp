var express = require('express');
var auth = require('basic-auth');
var router = express.Router();
var mashApi = require('../lib/mashery-api-oauth.js');

router.get('/:serviceKey', function(req, res, next) {
  res.status(400);
  res.send({error: 'invalid_request'});
});

router.post('/:serviceKey', function(req, res, next) {

  var creds = auth(req);
  var clientId = '';
  var clientSecret = '';
  var redirectUri = '';
  var scope = '';
  var userContext = '';
  var authCode = '';

  // Check for client_id and client_secret
  if (!creds) {
    console.log('Authorization header not received. Checking POST parameters for credentials.');
    
    if (!req.body.client_id && !req.body.client_secret) {
      console.log('No client credentials found.');
    } else {
      clientId = req.body.client_id;
      clientSecret = req.body.client_secret;
    }
  } else {
    var clientId = creds.name;
    var clientSecret = creds.pass;
  }

  // Lots of potential error conditions
  if (!req.params.serviceKey) {
    res.status(400);
    res.send({error: 'invalid_request',
    error_description: 
     'This sample OAuth server requires a serviceKey in the URL.'});
  } else if (clientId == '' || clientSecret == '') {
    res.status(400);
    res.send({error: 'invalid_client'});
  } else if (!req.body.grant_type) {
    res.status(400);
    res.send({
      error: 'invalid_request',
      error_description: 'The grant_type is missing.'});
  } else if (req.body.grant_type == 'authorization_code' &&
      !req.body.code) {
    res.status(400);
    res.send({
      error: 'invalid_request',
      error_description: 'The code is missing.'});
  } else if (req.body.grant_type == 'password' && 
      (typeof req.body.username == 'undefined' ||
      typeof req.body.password == 'undefined')) {
    res.status(400);
    res.send({
      error: 'invalid_request',
      error_description: 'The username and/or password is missing'});
  } else if (req.body.grant_type == 'refresh_token' && 
      !req.body.refresh_token) {
    res.status(400);
    res.send({
      error: 'invalid_request',
      error_description: 'The refresh_token is missing'});
  } else if (req.body.grant_type != 'authorization_code' &&
      req.body.grant_type != 'password' &&
      req.body.grant_type != 'client_credentials' &&
      req.body.grant_type != 'refresh_token') {
    res.status(400);
    res.send({error: 'unsupported_grant_type'});
  } else {
  // We made it! Now we can connect to Mashery...
    
    // Set appropriate parameters per grant type first
    switch (req.body.grant_type) {
      case 'authorization_code':
        authCode = req.body.code;
        if (typeof req.body.redirect_uri != 'undefined')
          redirectUri = req.body.redirect_uri;
        break;
      case 'password':

      // ##### This is for resource owner password credentials
      // ## There is no IDP configured here, so the username is used for
      // ## user_context. You would inject an IDP in here if you wanted
      // ## to validate the resource owner's credentials
      // ## (req.body.username and req.body.password)

        userContext = req.body.username;
        if (typeof req.body.scope != 'undefined')
          scope = req.body.scope; 
        break;
      case 'client_credentials':
        if (typeof req.body.scope != 'undefined')
          scope = req.body.scope; 
        break;
      case 'refresh_token':
        authCode = req.body.refresh_token;
        if (typeof req.body.scope != 'undefined')
          scope = req.body.scope; 
        break;
    }

    // Call Mashery API
    mashApi.createAccessToken(req.body.grant_type, req.params.serviceKey,
      clientId, redirectUri, scope, userContext, clientSecret, authCode,
      function(resp){

        if (resp.error) {
          var errorResp = '';

          if (typeof resp.error.error == 'undefined') {
            errorResp.error = 'invalid_client';
            errorResp.error_description = resp.error.message;
          } else if (!resp.error.error.error_response){
            errorResp = resp.error.error;
          } else {
            errorResp = resp.error.error.error_response.response;
          }
          res.status(400);
          res.send(errorResp);
        } else {
          var oauthRes = {};
          oauthRes.access_token = resp.result.access_token;
          oauthRes.token_type = resp.result.bearer;
          oauthRes.expires_in = resp.result.expires_in;

          if (typeof resp.result.refresh_token == 'string')
            oauthRes.refresh_token = resp.result.refresh_token;

          res.send(oauthRes);
        }
    }); 

  }

});



module.exports = router;
