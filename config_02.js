//config.js: Configuration determination

var debug = require('debug')('config');
debug("Configuring environment...");

//Use these as the default
module.exports = {
    mongoServer: "localhost",
    mongoPort: "27017",
    serverPort: 3000,
    docdbServer: "https://dean.documents.azure.com:443/",
    docdbKey: "OB4se23m0E7yVchAadSuPzajVo760ldelPyO90nICDCzK0W5uRvXh0rRYCLs5ZoAa89B9IOZbC4faxZmJbUgbg=="
};

if (process.env["ENV"] === "prod") {
    module.exports.mongoServer = "ds054308.mongolab.com";
    module.exports.mongoPort = "54308";
    module.exports.docdbServer = process.env["DOCDB_HOST"];
    module.exports.docdbKey = process.env["DOCDB_KEY"];
}

if (process.env.PORT) {
    module.exports.serverPort = process.env.PORT;
}