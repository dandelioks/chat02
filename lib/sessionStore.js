let mongoose = require('mongoose');
let express = require('express');
let MongoStore = require('connect-mongo')(express);

let sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

module.exports = sessionStore;