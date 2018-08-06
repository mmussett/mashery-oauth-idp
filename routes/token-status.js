//

var express = require('express');
var auth = require('basic-auth');
var router = express.Router();
var mashApi = require('../lib/mashery-api-oauth.js');
var props = require('../properties.js');

router.get('/', function(req, res, next) {

  var serviceKey = (props.clientServiceKey) ? props.clientServiceKey : '';
  var clientId = (props.clientApiKey) ? props.clientApiKey : '';
  var clientSecret = (props.clientApiSecret) ? props.clientApiSecret : '';

  res.render('token-status', { 
    title: 'User Managed Access Token Status',
    serviceKey: serviceKey,
    clientId: clientId,
    clientSecret: clientSecret,
    baseUri: props.oauthTokenStatusUri,
  });
});

// API Calls made by the token-status and token-tester pages.
// Note that these are NOT secured and this methods should NOT be used
// in a non-demo environment!

router.get('/fetchUserApplications', function(req, res, next) {
  mashApi.fetchUserApplications(req.query.service_key, 
    req.query.user_context, function(resp){
      res.send(resp);
  });
});

router.get('/fetchAccessToken', function(req, res, next) {
  mashApi.fetchAccessToken(req.query.service_key, 
    req.query.access_token, function(resp){
      res.send(resp);
  });
});

router.get('/revokeAccessToken', function(req, res, next) {
  mashApi.revokeAccessToken(req.query.service_key, 
    req.query.client_id, req.query.access_token, function(resp){
      res.send(resp);
  });
});

router.get('/revokeUserApplication', function(req, res, next) {
  mashApi.revokeUserApplication(req.query.service_key, 
    req.query.client_id, req.query.user_context, function(resp){
      res.send(resp);
  });
});

router.get('/updateAccessToken', function(req, res, next) {
  mashApi.updateAccessToken(req.query.service_key, 
    req.query.client_id, req.query.client_secret,
    req.query.access_token, req.query.expiry, function(resp){
      res.send(resp);
  });
});

module.exports = router;
