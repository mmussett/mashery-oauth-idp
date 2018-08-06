var express = require('express');
var router = express.Router();
var props = require('../properties.js');


var serviceKey = (props.clientServiceKey) ? props.clientServiceKey : '';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { 
    title: 'Sign in',
    oauthServerAuthUri: props.oauthServerAuthUri,
    oauthServerTokenUri: props.oauthServerTokenUri,
    oauthTokenTesterUri: props.oauthTokenTesterUri,
    oauthTokenStatusUri: props.oauthTokenStatusUri,
    serviceKey: serviceKey,
  });
});

module.exports = router;