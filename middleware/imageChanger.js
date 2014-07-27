var fs = require('fs');
var log = require('../libs/logs')(module);


module.exports = function (req, res, next) {
	if (req.path.substr(req.path.lastIndexOf('/'), 7) === '/avatar') {
		var path = req.path.slice(req.path.lastIndexOf('/'));
		fs.stat('./public/images'+path, function(err, stat) {
			if (err) {
				log.error(err);
				res.statusCode = 500;
				res.end();
				return;
			}
			var ctime = new Date(stat.ctime);
			var head = req.get('If-Modified-Since');
			if (!head) head = 0;
			var headerDate = new Date(head);
			if (headerDate.valueOf() >= ctime.valueOf()) {
				res.writeHead(304, {
					'Accept-Ranges': 'bytes',
					'Cache-Control': 'public, max-age=0',
					'Last-Modified': ctime.toUTCString()
				});
				return res.end();
			} else {
				res.writeHead(200, {
					'Accept-Ranges': 'bytes',
					'Cache-Control': 'public, max-age=0',
					'Last-Modified': ctime.toUTCString()
				});
				var file = new fs.ReadStream('./public/images'+path);
				return sendAvatar(file, res);
			}
		});
	} else {
		return next();
	}
	
	function sendAvatar (file, res) {
	
		file.pipe(res);
		
		file.on('error', function(err) {
			res.statusCode = 500;
			res.end('Error!');
			log.error(err);
		});
			
		res.on('close', function() {
			file.destroy();
			log.warn('Avatar connection closed badly!');
		});
	}
}