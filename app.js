var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./config');
var log = require ('./libs/logs')(module);
var HttpError = require('./error').HttpError;
var mongoose = require('./libs/mongoose');
var sessionStore = require('./libs/sessionStore');

var app = express();

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());

app.use(express.cookieParser());

var MongoStore = require('connect-mongo')(express);
app.use(express.session({
	secret: config.get ('session:secret'),
	key: config.get ('session:key'),
	cookie: config.get ('session:cookie'),
	store: sessionStore
}));

app.use(require('./middleware/guestControl'));

app.use(require('./middleware/sendHttpError'));

app.use(require('./middleware/loadUser'));

app.use(app.router);

require('./routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./middleware/imageChanger')); // это миддвэр, который подменяет запрос к аватарке пользователя, если её нет, на запрос к общей аватарке

app.use(function (req, res, next) {
	return next(new HttpError(404, 'Page not found!'));
});

app.use(function (err, req, res, next) {
  if (typeof err == 'number') {
    err = new HttpError (err);
  }
  
  if (err instanceof HttpError) {
	res.sendHttpError(err);
  } else {
  
    if ('development' == app.get('env')) {
      var errorHandler = express.errorHandler();
	  errorHandler(err, req, res, next);
    } else {
	  log.error(err);
	  err = new HttpError (500);
	  res.sendHttpError(err);
	}
  }
});

var server = http.createServer(app);
server.listen(config.get('port'), function(){
  	log.info('Express server listening on port ' + config.get('port'));
	mongoose.models.User.findOne({username: "Arch"}, function(err, user) {
		if (err) return log.error(err.message);
		user.newBlog('Сервер запущен '+ user.datify(new Date()));
		app.set('io', io);
		app.set('serverInfo', {
			version: config.get('version'),
			lastStart: new Date(),
			adminId: user._id
		});
	});
});

var io = require('./socket')(server);
