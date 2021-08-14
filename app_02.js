// Load modules
var bodyParser = require('body-parser');
var express = require('express');
var _ = require('lodash');
var debug = require('debug')('app');

var personData = [
    {
        "id": 1,
        "firstName": "Ted",
        "lastName": "Neward",
        "status": "MEANing"
    },
    {
        "id": 2,
        "firstName": "Brian",
        "lastName": "Randell",
        "status": "TFSing"
    },
    {
        "id": 3,
        "firstName": "Pablo-Tomás",
        "lastName": "Pareja Fernández",
        "status": "SPFxing"
    }
];

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
    var response = personData;
    res.send(JSON.stringify(response));
}

app.get('/persons', getAllPersons);

var getPerson = function (req, res) {
    if (req.person) {
        res.send(200, JSON.stringify(req.person));
    }
    else {
        res.send(400, { message: "Unrecognized identifier: " + identifier })
    }
}

app.get('/persons/:personId', getPerson);

app.param('personId', function (req, res, next, personId) {
    debug("personId found:", personId);
    var person = _.find(personData, function (it) {
        return personId === it.id.toString();
    });

    debug("person:", person);
    req.person = person;

    next();
});

var deletePerson = function (req, res) {
    if (req.person) {
        debug("Removing", req.person.firstName, req.person.lastName);
        _.remove(personData, function (it) {
            return it.id === req.person.id;
        });

        debug("personData=", personData);
        var response = { message: "Deleted sucessfully" };
        res.status(200).jsonp(response);
    }
    else {
        var response = { message: "Unecognized person identifier" };
        res.status(404).jsonp(response);
    }
}

app.delete('/persons/:personId', deletePerson);


var insertPerson = function (req, res) {
    var person = req.body;
    debug("Received", person);
    person.id = personData.length + 1;
    personData.push(person);
    res.status(200).jsonp(person);
}

app.post('/persons', insertPerson);


var updatePerson = function (req, res) {
    if (req.person) {
        var originalPerson = req.person;
        var incomingPerson = req.body;
        var newPerson = _.merge(originalPerson, incomingPerson);
        res.status(200).jsonp(newPerson);
    }
    else {
        res.status(400).jsonp({ message: "Unrecognized person identifier" });
    }
}

app.put('/persons/:personId', updatePerson);

// Start the server
var port = process.env.PORT || 3000;
debug("We picked up", port, "for the port");
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});