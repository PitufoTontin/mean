//config.js: Configuration determination

var debug = require('debug')('config');
debug("Configuring environment...");

//Use these as the default
module.exports = {
    mongoServer: "localhost",
    mongoPort: "27017",
    serverPort: 3000
};

if(process.env["ENV"] === "prod") {
    module.exports.mongoServer = "ds054308.mongolab.com";
    module.exports.mongoPort = "54308";
}

if(process.env.PORT) {
    module.exports.serverPort = process.env.PORT;
}