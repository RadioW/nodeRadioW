var forAuth = require('../middleware/forAuth');
var forNotAuth = require('../middleware/forNotAuth');
var loadUser = require('../middleware/loadUser');
var forAdmin = require('../middleware/forAdmin');
var answerOK = require('../middleware/answerOK'); // миддвэр который заканчивает ajax запрос, по сути он отправляет "ok!";
var express = require('express');
var userRoute = require('./user');

module.exports = function (app) {

	app.get('/', loadUser, require('./frontpage').get);
	
	app.get('/login', loadUser, forNotAuth, require('./login').get);
	app.post('/login', loadUser, forNotAuth, require('./login').post);
	app.post('/logout', loadUser, forAuth, require('./logout').post);
	app.get('/registration', loadUser, forNotAuth, require('./registration').get);
	app.post('/registration', loadUser, forNotAuth, require('./registration').post);
	
	app.get('/users', loadUser, require('./users').get);
	app.get('/user/:id', loadUser, userRoute.get);
	app.post('/user/saveInfo', loadUser, forAuth, userRoute.saveInfo);
	app.post('/user/savePhoto', loadUser, express.multipart({uploadDir: './temp'}), forAuth, userRoute.savePhoto, answerOK);
	app.post('/user/saveFile', loadUser, express.multipart({uploadDir: './temp'}), forAuth, userRoute.saveFile, answerOK);
	app.post('/user/saveAvatar', loadUser, express.multipart({uploadDir: './temp'}), forAuth, userRoute.savePhoto, userRoute.makeAvatar, answerOK);
	app.post('/user/makeAvatar/:id', loadUser, forAuth, userRoute.prepareAva, userRoute.makeAvatar, answerOK);
	app.post('/user/photoDescription/:id', loadUser, forAuth, userRoute.photoDescription);
	app.get('/user/:id/:tool/:pid', loadUser, userRoute.tool);
    app.get('/user/:id/:tool', loadUser, userRoute.tool);
	app.get('/music', loadUser, forAuth, require('./music').get);
	
	//app.get('/conclave', forAuth, forAdmin, require('./conclave').get);
	//app.post('/conclave/give', forAuth, forAdmin, require('./conclave').give);
	//app.post('/conclave/del', forAuth, forAdmin, require('./conclave').del);
	//app.post('/conclave/kill', forAuth, forAdmin, require('./conclave').kill, answerOK);
	
	//app.get('/chat', require('./chat').get);
	
	//app.get('/guests', require('./guests').get);
	//app.get('/guests/d', require('./guests').del);
};