// Load modules
var bodyParser = require('body-parser');
var express = require('express');
var _ = require('lodash');
const { MongoClient } = require('mongodb');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var debug = require('debug')('app');
var cosmosDB = require('@azure/cosmos');

//Go get your configuration settings
var config = require('./config.js');
debug("Mongo is available at ", config.mongoServer, ":", config.mongoPort);
debug("DocDB is available at ", config.docdbServer);

// Connect to MongoDB
var mongoURL = "mongodb://" + config.mongoServer + ":" + config.mongoPort;
mongoose.connect(mongoURL + "/msdn-mean", { useNewUrlParser: true, useUnifiedTopology: true });

// Connecto to DocumentDB
const cosmosClient = new cosmosDB.CosmosClient({ endpoint: config.docdbServer, key: config.docdbKey });
// cosmosClient.databases.readAll().fetchAll().then((databases) => {
//     debug(databases.resources);
//     databases.resources.map((resource) => {
//         cosmosClient.database(resource.id).containers.readAll().fetchAll().then((containers) => {
//             debug(containers);
//         });
//     });
// });

cosmosClient.queryDatabases({
    query: 'SELECT * FROM root r WHERE r.id = @id',
    parameters: [
        {
            name: '@id',
            value: 'conferencedb'
        }
    ]
}).toArray(function (err, results) {
    if (err) {
        handleError(err);
    }

    if (results.length === 0) {
        // No error occured, but there were no results returned
        // indicating no database exists matching the query
        // so, explictly return null
        debug("No results found");
    } else {
        debug('Found a database: ', results[0]);
        var docDB = results[0];
        debug('Looking for collections:');
        cosmosClient.readCollections('dbs/conferencedb').toArray(function (err, colls) {
            if (err) {
                debug(err);
            }
            else {
                if (colls.length === 0) {
                    debug("No collections found");
                }
                else {
                    for (var c in colls) {
                        debug("Found collection", colls[c]);
                        if (colls[c].id === 'presentations') {
                            presentationColl = colls[c];
                        }
                    }
                }
            }
        });
    }
});

var getAllPresentations = function (req, res) {
    debug("Getting all presentations from DocumentDB:");
    cosmosClient.queryDocuments("dbs/conferencedb/colls/presentations", {
        query: "SELECT * FROM presentations p"
    }).toArray(function (err, results) {
        if (err) {
            res.status(500).jsonp(err);
        }
        else {
            res.status(200).jsonp(results);
        }
    });
}

app.get('/presentations', getAllPresentations);

//Define our Mongoose Schema
var personSchema = mongoose.Schema({
    created: {
        type: Date,
        default: Date.now()
    },
    updated: {
        type: Date,
    },
    firstName: {
        type: String,
        required: true,
        default: "(No name specified)"
    },
    lastName: {
        type: String,
        required: true,
        default: "(No lastname specified)"
    },
    status: {
        type: String,
        required: true,
        enum: [
            "Reading MSDN",
            "WCFing",
            "RESTing",
            "VBing",
            "C#ing"
        ],
        default: "Reading MSDN"
    }
});

personSchema.pre("save", function (next) {
    this.updated = new Date();
    next();
});

personSchema.method("speak", function () { console.log("Don't bother me, I'm", status) });

var Person = mongoose.model('Person', personSchema, "persons");

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
    Person.find(function (err, persons) {
        if (err) {
            debug("getAllPersons--ERROR:", err);
            res.status(500).jsonp(err);
        }
        else {
            debug("getAllPersons:", persons);
            res.status(200).jsonp(persons);
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
        Person.findById(personId).then(function (person) {
            debug("Found", person.lastName);
            req.person = person;
            next();
        });
    }
    else {
        res.status(404).jsonp({ message: 'ID ' + personId + ' not found' });
    }
});

// Person.find({}).sort({ 'firstName': 'asc', 'lastName': 'desc' }).select({ 'firstName lastName status'}).then(function (persons) {
//     //Do something with the returned persons
// });

var deletePerson = function (req, res) {
    debug("Removing", req.person.firstName, req.person.lastName);
    req.person.delete(function (err, result) {
        if (err) {
            debug("deletePerson: ERROR:", err);
            res.status(500).jsonp(err);
        }
        else {
            res.status(200).jsonp(req.person);
        }
    });
}

app.delete('/persons/:personId', deletePerson);


var insertPerson = function (req, res) {
    var person = new Person(req.body);
    debug("Received", person);

    person.save(person, function (err, person) {
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
    //The req.person is already a Person, so just update()
    req.person.save(function (err, person) {
        if (err) {
            res.status(500).jsonp(err);
        }
        else {
            res.status(200).jsonp(person);
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