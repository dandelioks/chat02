let express = require('express');
let http = require('http');
let fs = require('fs');
let path = require('path');
//let amama = require('./amama.json');
//let momo = require('momo/momo.json');
let config = require('./config');
let log = require('./lib/log')(module);
let mongoose = require('./lib/mongoose');
let HttpError = require('error').HttpError;

let app = express();

//app.engine('ejs', require('ejs-locals'));
//app.set('views', __dirname + '/template');
//app.set('view engine', 'ejs');

app.set('views', __dirname + '/template');
app.set('view engine', 'jade');

app.use(express.favicon());

if (app.get('env') == 'development') {
  app.use(express.logger('dev'));
} else {
  app.use(express.logger('default'));
}

app.use(express.bodyParser(
    {
      keepExtensions: true,
      uploadDir: './public/uploads/'
    }
    )
);

app.use(express.cookieParser());

let sessionStore = require('lib/sessionStore');

app.use(express.session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore
}));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

app.use(app.router);

require('routes')(app);

app.use(express.static(path.join(__dirname, 'public')));


app.use(function (err, req, res, next) {
  if (typeof err == 'number') {
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development') {
      express.errorHandler()(err, req, res, next);
    } else {
      log.error(err);
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});


let server = http.createServer(app);

let io = require('./socket')(server);
app.set('io', io);

server.listen(config.get('port'), function () {
  console.log("Server started at %d port", config.get('port'));
});
