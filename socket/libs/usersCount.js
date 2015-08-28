

exports.users = function users(io) {
		var user = {};
		var clients = io.of('/main').connected;
	
		for (var key in clients) {
			if (clients.hasOwnProperty(key) && clients[key].request.session) {
				if (user[clients[key].request.session.id]) {
					user[clients[key].request.session.id].count++;
				} else {
					user[clients[key].request.session.id] = {
						username: clients[key].request.user.get('username'),
						count: 1,
						isGuest: clients[key].request.user.isGuest,
						id: clients[key].request.user._id.toString()
					};
				}
			}
		}
		return getUsersAndGuests(user);
	};


function getUsersAndGuests(user) {
	var users = {};
	var guests = {};
	var uC = 0;
	var gC = 0;
	for (var key in user) {
		if (user.hasOwnProperty(key)) {
			if (user[key].isGuest) {
				guests[user[key].username] = {
					name: user[key].username
				};
				gC++;
			} else {
				if (!users[user[key].username]) {
					users[user[key].username] = {
						name: user[key].username,
						id: user[key].id
					};
					uC++
				}


			}
		}
	}
	return {users: users, userCount: uC, guests: guests, guestCount: gC};
}

exports.windows = function countWindows(io, room, sid) {
		var clients = io.of(room).connected;
		var count = 0;
		for (var key in clients) {
			if (clients[key].request.session.id == sid) count++;
		}
		return count;
	};