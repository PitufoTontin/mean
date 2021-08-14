// Load modules
var bodyParser = require('body-parser');
var express = require('express');
var _ = require('lodash');
const { MongoClient } = require('mongodb');
var mongodb = require('mongodb');
var debug = require('debug')('app');

//Go get your configuration settings
var config = require('./config.js');
debug("Mongo is available at", config.mongoServer, ":", config.mongoPort);

// Connect to MongoDB
var mongo = null;
var persons = null;
var mongoURL = "mongodb://" + config.mongoServer + ":" + config.mongoPort;
debug("Attempting connection to mongo @", mongoURL);
MongoClient.connect(mongoURL, function (err, client) {
    if (err) {
        debug("ERROR:", err);
    }
    else {
        debug("Connected correctly to server");
        mongo = client.db("msdn-mean");
        mongo.collections(function (err, collections) {
            if (err) {
                debug("ERROR:", err);
            }
            else {
                for (var c in collections) {
                    debug("Found collection", collections[c]);
                }

                persons = mongo.collection("persons");
            }
        });
    }
});

// Create express instance
var app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.append('Content-Type', 'application/json');
    next();
});

// Set up a simple route
app.get('/', function (req, res) {
    debug("/ requested");
    res.send('Hello World guapísimo!');
});

var getAllPersons = function (req, res) {
    persons.find({}).toArray(function (err, results) {
        if (err) {
            debug("getAllPersons--ERROR:", err);
            res.status(500).jsonp(err);
        }
        else {
            debug("getAllPersons:", results);
            res.status(200).jsonp(results);
        }
    });
}

app.get('/persons', getAllPersons);

var getPerson = function (req, res) {
    res.status(200).jsonp(req.person);
}

app.get('/persons/:personId', getPerson);

app.param('personId', function (req, res, next, personId) {
    debug("personId found:", personId);
    if (mongodb.ObjectId.isValid(personId)) {
        persons.find({ "_id": new mongodb.ObjectId(personId) })
            .toArray(function (err, docs) {
                if (err) {
                    debug("ERROR: personId:", err);
                    res.status(500).jsonp(err);
                }
                else if (docs.length < 1) {
                    res.status(404).jsonp({ message: 'ID ' + personId + ' not found' });
                }
                else {
                    debug("person:", docs[0]);
                    req.person = docs[0];
                    next();
                }
            });
    }
    else {
        res.status(404).jsonp({ message: 'ID ' + personId + ' not found' });
    }

});

var deletePerson = function (req, res) {
    debug("Removing", req.person.firstName, req.person.lastName);
    persons.deleteOne({ "_id": req.person._id }, function (err, result) {
        if (err) {
            debug("deletePerson: ERROR:", err);
            res.status(500).jsonp(err);
        }
        else {
            req.person._id = undefined;
            res.status(200).jsonp(req.person);
        }
    });
}

app.delete('/persons/:personId', deletePerson);


var insertPerson = function (req, res) {
    var person = req.body;
    debug("Received", person);
    // person.id = personData.length + 1;
    // personData.push(person);
    persons.insert(person, function (err, result) {
        if (err) {
            res.status(500).jsonp(err);
        }
        else {
            res.status(200).jsonp(person);
        }
    });
}

app.post('/persons', insertPerson);


var updatePerson = function (req, res) {
    debug("Updating", req.person, "with", req.body);
    _.merge(req.person, req.body);
    persons.updateOne({ "_id": req.person._id }, {
        $set: { firstName: req.person.firstName, lastName: req.person.lastName, status: req.person.status }
    }, function (err, result) {
        if (err) {
            res.status(500).jsonp(err);
        }
        else {
            res.status(200).jsonp(result);
        }
    });
}

app.put('/persons/:personId', updatePerson);

// Start the server
debug("We picked up", config.serverPort, "for the port");
var server = app.listen(config.serverPort, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});