// Sample OAuth IDP integrating with the Mashery OAuth Accelerator
// Author: Eurus Kim
//
// This app is for demo purposes only.
// Notes: 
// 1. This demo server only uses the HTTP protocol and, as a result, the
//    resource owner's username and password are passed through the app in the
//    clear. For security purposes, you should use HTTPS
// 2. The demo server exposes some of the Mashery Platform OAuth APIs as GET
//    methods on ./routes/token-status.js. This is NOT a secure mechanism and
//    should NOT be used outside of demos.
//
// *** Use at your own risk! ***
//
// To use this app:
// 1. Run 'npm install' to add all the node_modules dependencies
// 2. Modify the ./properties.js file to add your Mashery area and credential
//    details.
// 3. Run 'node app.js'



var express = require('express');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var props = require('./properties.js');

var morgan = require('morgan');

// Hardening: Enable TLS
var http = require('http');
//var https = require('https');
var fs = require('fs');

var sslOptions = {
  key: fs.readFileSync(__dirname + '/certs/key.pem'),
  cert: fs.readFileSync(__dirname + '/certs/cert.pem'),
    passphrase: 'tibco123'
};

// Hardening: Use helmet
var helmet = require('helmet');

// Initiate Express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(morgan('combined'));

app.use(function(req, res, next) {
  var aYear = 60 * 60 * 24 * 365;
  res.set('Strict-Transport-Security', 'max-age='+aYear+';includeSubdomains');

  next();
});

// Hardening: Enable TLS endpoint
//https.createServer(sslOptions, app).listen(8443);

// Hardening: Force HTTP redirect to HTTPS
//http.createServer(function(req,res) {
//  res.writeHeader(301, {
//    Location: 'https://'+req.headers.host + req.url
//  });
//  res.end();
//}).listen(8080);

// Harening: Disable X-Powered-by
app.disable('x-powered-by');

// Set the port listener for the app. It will default to the environment
// variable of PORT if it is set 
app.set('port', process.env.PORT || 8080);

// Set public directory for static files
app.use(express.static(__dirname + '/public'));


// Set all the route
// The OAuth Server is primarily two routes: authEndpoint and tokenEndpoint
// The authEndpoint is the Authorization Endpoint for the OAuth Server
// The tokenEndpoint is the Token Endpoint for the OAuth Server
// The home is just an informational page
// The tokenTester is a sample client to call the tokenEndpoint
// The tokenStatus is a sample user managed token access page

var home = require('./routes/home.js');
var authEndpoint = require('./routes/auth-endpoint.js');
var tokenEndpoint = require('./routes/token-endpoint.js');
var tokenTester = require('./routes/token-tester.js');
var tokenStatus = require('./routes/token-status.js');

app.use('/', home);
app.use(props.oauthServerAuthUri, authEndpoint);
app.use(props.oauthServerTokenUri, tokenEndpoint);
app.use(props.oauthTokenTesterUri, tokenTester);
app.use(props.oauthTokenStatusUri, tokenStatus);

// Error pages

// custom 404 page
app.use(function(req, res, next) {
  res.status(404);
  res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('OAuth server started on on https://localhost:8443' + '; press Ctrl-C to terminate.' );
}); 

