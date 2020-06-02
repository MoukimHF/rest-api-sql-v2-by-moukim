'use strict'; // load modules

var express = require('express');

var morgan = require('morgan');

var sequelize = require('./models').sequelize;

var routes = require('./routes'); // variable to enable global error logging


var enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true'; // create the Express app

var app = express(); // setup morgan which gives us http request logging

app.use(morgan('dev'));
app.use(express.json());
app.use('/api', routes); // TODO setup your api routes here
// setup a friendly greeting for the root route

app.get('/', function (req, res) {
  res.json({
    message: 'Welcome to the REST API project!'
  });
}); // send 404 if no other route matched

app.use(function (req, res) {
  res.status(404).json({
    message: 'Route Not Found'
  });
}); // setup a global error handler

app.use(function (err, req, res, next) {
  if (enableGlobalErrorLogging) {
    console.error("Global error handler: ".concat(JSON.stringify(err.stack)));
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
}); // set our port
// start listening on our port

app.set('port', process.env.PORT || 5000);
var server = app.listen(app.get('port'), function () {
  console.log("Express server is listening on port ".concat(server.address().port));
});
sequelize.sync(function () {
  if (sequelize.authentificate()) {
    console.log('database connection established successfully ');
  } else {
    console.log('database not connected');
  }
});