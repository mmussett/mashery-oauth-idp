var express = require('express');
var auth = require('basic-auth');
var router = express.Router();
var mashApi = require('../lib/mashery-api-oauth.js');
var props = require('../properties.js');

router.get('/', function(req, res, next) {

  var serviceKey = (props.clientServiceKey) ? props.clientServiceKey : '';
  var clientId = (props.clientApiKey) ? props.clientApiKey : '';
  var clientSecret = (props.clientApiSecret) ? props.clientApiSecret : '';

  res.render('token-tester', { 
    title: 'OAuth Token Endpoint Tester',
    serviceKey: serviceKey,
    clientId: clientId,
    clientSecret: clientSecret,
    oauthServerTokenUri: props.oauthServerTokenUri,
    oauthTokenStatusUri: props.oauthTokenStatusUri,
  });
});

module.exports = router;
