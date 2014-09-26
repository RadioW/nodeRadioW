

exports.users = function users(io) {
		var user = {};
		var clients = io.of('/main').connected;
	
		for (var key in clients) {
			if (user[clients[key].request.session.id]) {
				user[clients[key].request.session.id].count++;
			} else {
				user[clients[key].request.session.id] = {
												username: clients[key].request.user.get('username'),
												count: 1,
												isGuest: false
				};
				if (user[clients[key].request.session.id].username.slice(0, 6) == 'Guest ') {
					user[clients[key].request.session.id].isGuest = true;
				}
			}
		}
		return getUsersAndGuests(user);
	};


function getUsersAndGuests(user) {
	var users = [];
	var guests = [];
	for (var key in user) {
		if (user[key].isGuest) {
			guests.push(user[key].username)
		} else {
			users.push(user[key].username)
		};
	}
	return {users: users, guests: guests};
}

exports.windows = function countWindows(io, room, sid) {
		var clients = io.of(room).connected;
		var count = 0;
		for (var key in clients) {
			if (clients[key].request.session.id == sid) count++;
		}
		return count;
	}