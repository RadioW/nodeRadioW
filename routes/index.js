var forAuth = require('../middleware/forAuth');
var forNotAuth = require('../middleware/forNotAuth');
var forAdmin = require('../middleware/forAdmin');
var answerOK = require('../middleware/answerOK'); // миддвэр который заканчивает ajax запрос, по сути он отправляет "ok!";
var express = require('express');
var userRoute = require('./user');

module.exports = function (app) {

	app.get('/', require('./frontpage').get);
	
	app.get('/login', forNotAuth, require('./login').get);
	app.post('/login', forNotAuth, require('./login').post);
	app.post('/logout', forAuth, require('./logout').post);
	app.get('/registration', forNotAuth, require('./registration').get);
	app.post('/registration', forNotAuth, require('./registration').post);
	
	app.get('/users', require('./users').get);
	app.get('/user/:id', userRoute.get);
	app.post('/user/saveInfo', forAuth, userRoute.saveInfo);
	app.post('/user/savePhoto', express.multipart({uploadDir: './temp'}), forAuth, userRoute.savePhoto, answerOK);
	app.post('/user/saveAvatar', express.multipart({uploadDir: './temp'}), forAuth, userRoute.savePhoto, userRoute.makeAvatar, answerOK);
	app.post('/user/makeAvatar/:id', forAuth, userRoute.prepareAva, userRoute.makeAvatar, answerOK);
	app.post('/user/removePhoto/:id', forAuth, userRoute.removePhoto, answerOK);
	app.post('/user/photoDescription/:id', forAuth, userRoute.photoDescription);
	app.get('/user/:id/photo/:pid', userRoute.photo);
	app.get('/user/:id/:tool', userRoute.tool);
	
	app.get('/conclave', forAuth, forAdmin, require('./conclave').get);
	app.post('/conclave/give', forAuth, forAdmin, require('./conclave').give);
	app.post('/conclave/del', forAuth, forAdmin, require('./conclave').del);
	app.post('/conclave/kill', forAuth, forAdmin, require('./conclave').kill, answerOK);
	
	app.get('/chat', require('./chat').get);
	
	app.get('/guests', require('./guests').get);
	app.get('/guests/d', require('./guests').del);
};