// Load modules
var express = require('express');
var debug = require('debug')('app');

// Create express instance
var app = express();

// Set up a simple route
app.get('/', function(req, res) {
    debug("/ requested");
    res.send('Hello World guapísimo!');
});

// Start the server
var port = process.env.PORT || 3000;
debug("We picked up", port, "for the port");
var server = app.listen(port, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});