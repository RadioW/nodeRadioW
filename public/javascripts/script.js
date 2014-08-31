function getCoords (elem) {
  var box = elem.getBoundingClientRect ();
  var body = document.body;
  var docEl = document.documentElement;
  
  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
  
  var clientTop = docEl.clientTop || body.clientTop || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;
  
  var top = box.top + scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;
  var right = box.right + scrollLeft - clientLeft;
  var bottom = box.bottom + scrollTop - clientTop;
  
  return  { top: Math.round(top), left: Math.round(left), right: Math.round(right), bottom: Math.round(bottom)};
}

function collapseQuad (){
	$('#cover').get(0).onclick = null;
	var source = $('#source-div').get(0);
	source.place = getCoords(source);
	var carett = $('#carett').get(0);
	carett.place = getCoords(carett);
	$('#cover').css('opacity', 0);
	var car = carett.children[0];
	car.style.width = source.place.right - source.place.left+'px';
	car.style.height = source.place.bottom - source.place.top+'px';
	car.style.position = 'absolute';
	car.style.top = source.place.top+'px';
	car.style.left = source.place.left-carett.place.left+'px';
	car.children[0].children[1].style.opacity = 0;
	setTimeout (function() {
		$('#cover').css('display', 'none');
		var quad = car.children[0];
		carett.removeChild(car);
		source.children[0].innerHTML = quad.innerHTML;
		carett.style.display = 'none';
		source.id = '';
		var quad = source.children[0];
		quad.removeChild(quad.children[1]);
		quad.children[0].style.display = 'block';
		quad.style.display = 'block'
		history.pushState(null, null, quad.href.slice(0, quad.href.lastIndexOf('/')))
		quad.onclick = function() {
			showQuad(quad);
			return false;
		}
	}, 500)
}

function showQuad(quad) {
	quad.onclick = function() {return false;};
	quad.style.display = 'none';
	var thumb = document.createElement('div');
	thumb.className = "thumbnail thumbnail-v";
	thumb.style.height = "100%";
	thumb.innerHTML = quad.innerHTML
	quad.parentNode.appendChild(thumb);
	
	var tool = document.createElement('div');
	tool.className = "container-fluid op";
	tool.style.height = "100%";
	$.ajax({
		url: quad.href,
		method: 'GET',
		data: null,
		statusCode:{
			200: function(jqXHR) {
				tool.innerHTML = jqXHR;
				tool.style.opacity = 1;
				var script = $('script', tool).get(0); // Если в инструменте есть тег скрипт - эта приписка его запустит
				if (script) {
					var start = new Function ('', script.innerHTML);
					start();
				}
			}
		}
	});
	thumb.children[0].style.display = 'none';
	thumb.appendChild(tool);
	
	var place = getCoords(quad.parentNode);
	quad.parentNode.id = "source-div";
	var carett = $('#carett').get(0);
	carett.style.display = 'block';
	carett.p = getCoords(carett);
	
	var car = document.createElement('div');
	car.className = "col-lg-4 col-md-6 col-lg-4-v col-md-6-v col-sm-6 col-sm-6-v";
	car.style.width = place.right - place.left+'px';
	car.style.height = place.bottom - place.top+'px';
	car.style.position = 'absolute';
	car.style.top = place.top+'px';
	car.style.left = place.left-carett.p.left+'px';
	quad.parentNode.removeChild(thumb);
	
	carett.appendChild(car);
	car.appendChild(thumb);
	$('#cover').css('display', 'block');
	
	setTimeout (function (){
		$('#cover').css('opacity', 0.5);
		car.className = 'col-xs-12 col-lg-12-v col-md-12-v col-sm-12-v col-xs-12-v';
		car.style.width = '';
		car.style.height = '';
		car.style.position = 'relative';
		car.style.top = '0px';
		car.style.left = '0px';
		$('#cover').get(0).onclick = function(){
			collapseQuad()
		}
	}, 1);
	return false;
}

function submitForm(form, url, modal, callback) {
	form = $(form)
	if (typeof modal == "function") {
		callback = modal;
		modal = true;
	}
	if (modal !== false) modal = true;
	
	$.ajax({
		url: url,
		method: 'POST',
		data: form.serialize(),
		statusCode: {
			200: function(response) {
				if (modal) {
					$('#errorModalMessage').html('Сохранено');
					$('#errorModal').modal();
				}
				if (callback) callback();
			},
			404: function(response) {
				if (modal) {
					$('#errorModalMessage').html('Не найдено');
					$('#errorModal').modal();
				}
			},
			403: function(response) {
				if (modal) {
					var ans = JSON.parse(response.responseText);
					$('#errorModalMessage').html(ans.message);
					$('#errorModal').modal();
				}
			},
			500: function(response) {
				if (modal) {
					var ans = JSON.parse(response.responseText);
					$('#errorModalMessage').html(ans.message);
					$('#errorModal').modal();
				}
			}
		}
	});
	return false;
}

function convertDate(date) {
	return date.getFullYear()+'-'+(date.getMonth()+1 > 9 ? date.getMonth()+1 : '0' + (date.getMonth() + 1))+'-'+(date.getDate() > 9 ? date.getDate() : '0'+date.getDate());
	
}

function updateHref(href, block) {
	$.ajax({
		url: href,
		method: 'GET',
		data: null,
		statusCode: {
			200: function(res) {
				block.html(res);
			}
		}
	})
}

function hideElement() {
	var elem = $('#blogFormCol').get(0);
	var roll = $('#blogRoll').get(0);
	var hideButton = $('.glyphicon-chevron-left').parent();
	var showButton = $('.glyphicon-chevron-right').parent();
	
	if (elem.style.width != "96%") {
		hideButton.prev().prop('disabled', true);
		hideButton.prop('disabled', true);
		elem.style.width = 0;
		elem.parentNode.style.width = "6%";
		roll.style.width = "94%";
		setTimeout (function() {
			elem.style.display = 'none';
			showButton.prop('disabled', false);
		}, 340);
	} else {
		elem.style.width = "";
		elem.nextSibling.nextSibling.style.width = "";
		elem.parentNode.style.width = "";
		roll.style.width = "10%";
		
		setTimeout (function() {
			roll.style.display = 'block';
			showButton.prop('disabled', false);
			setTimeout (function() {
				roll.style.width = "";
			}, 1);
		}, 150);
	}
}

function showElement() {
	var elem = $('#blogFormCol').get(0);
	var roll = $('#blogRoll').get(0);
	var hideButton = $('.glyphicon-chevron-left').parent();
	var showButton = $('.glyphicon-chevron-right').parent();
	
	if (elem.style.width != "") {
		elem.parentNode.style.width = "";
		roll.style.width = "";
	
		hideButton.prev().prop('disabled', false);
		hideButton.prop('disabled', false);
	
		setTimeout (function() {
			elem.style.display = 'block';
			setTimeout(function() {
				elem.style.width="";
			}, 1);
		}, 70);
	} else {
		elem.style.width = "96%";
		elem.nextSibling.nextSibling.style.width = "4%";
		elem.parentNode.style.width = "100%";
		roll.style.width = 0;
		
		setTimeout (function() {
			roll.style.display = 'none';
			showButton.prop('disabled', true);
		}, 340);
	}
};

function checkUsername(elem, defaultName) {
	if (elem.value.length < 3) {
		var div = $('#usernameInput').get(0);
		div.className = 'form-group has-error has-feedback';
		div.children[1].className = 'xs form-control-feedback glyphicon glyphicon-remove';
		return;
	}
	if (elem.value == defaultName) {
		var div = $('#usernameInput').get(0);
		div.className = 'form-group has-success has-feedback';
		div.children[1].className = 'xs form-control-feedback glyphicon glyphicon-ok';
		return;
	}
	socket.emit('check', elem.value);
}

function datify(timestamp) {
	var date = new Date(timestamp);
	var year = date.getFullYear();
	var month = date.getMonth();
	switch (month) {
		case 0:
			month = "января";
			break;
		case 1:
			month = "февраля";
			break;
		case 2:
			month = "марта";
			break;
		case 3:
			month = "апреля";
			break;
		case 4:
			month = "мая";
			break;
		case 5:
			month = "июня";
			break;
		case 6:
			month = "июля";
			break;
		case 7:
			month = "августа";
			break;
		case 8:
			month = "сентября";
			break;
		case 9:
			month = "октября";
			break;
		case 10:
			month = "ноября";
			break;
		case 11:
			month = "декабря";
			break;
	}
	var day = date.getDate();
	var minute = date.getMinutes() > 9 ? date.getMinutes() : '0'+date.getMinutes();
	var hour = date.getHours() > 9 ? date.getHours() : '0'+date.getHours();
	return day+" "+month+" "+year+" в "+hour+":"+minute;
}

function launchModal(message) {
	$('#errorModalMessage').html(message);
	$('#errorModal').modal();
}

function launchLargeModal(message) {
	$('#largeModalMessage').html(message);
	$('#largeModal').modal();
}

function showPhoto(userId, photoId) {
    var link = '/user/'+userId+'/photo/'+photoId;

	var modal = $('#largeModal');
	if ($('#fullSizeImg').get(0)) {
		var coords = getCoords($('#fullSizeImg').parent().get(0));
		$('#fullSizeImg').css({'opacity': 0, 'max-width': coords.right-coords.left});
		$('.modal-content', modal).get(0).children[0].id = 'modal-delete';
		setTimeout(function() {
			$('.modal-content', modal).children().css('width', '1px');
			
			$('#fullSizeImg').attr('id', '');
			launch();
		}, 200);
	} else {
		launch();
	}
	function launch() { 
		$.ajax({
			url: link,
			method: 'GET',
			data: null,
			statusCode: {
				200: function(jqXHR) {
					$('.modal-content', modal).append(jqXHR);
					$('#fullSizeImg').on('load', function() {
						$('#fullSizeImg').css('opacity', 1);
						$('#modal-delete').remove();
						$('#largeModal').modal();
//TODO
						clickers();
                        socket.emit('subscribe', userId, "photo", photoId);
						history.pushState(null, null, link);
					});
				},
				404: function() {
					launchModal('Мне очень жаль, но такой фотографии нет')
				},
				500: function() {
					launchModal('Произошла ошибка, скорее всего Вы неверно скопировали адрес ссылки')
				}
			}
		});
	}
}


function subscribeContent (userId, type, contentId) {
    socket.emit('subscribe', userId, type, contentId);
}

function makeThisAva(id) {
	$.ajax({
		url: '/user/makeAvatar/'+id,
		method: 'POST',
		data: null,
		statusCode: {
			200: function() {
				launchModal('Аватар успешно изменен');
                window.content.refresh();
			},
			403: function() {
				launchModal('Ошибка! Вам запрещена эта операция')
			},
			404: function() {
				launchModal('Ошибка! В Вашей коллекции нет такой фотографии')
			},
			500: function() {
				launchModal('Ошибка! Что-то пошло не так!')
			}
		}
	});
}

function removePhoto(id) {
		$.ajax({
		url: '/user/removePhoto/'+id,
		method: 'POST',
		data: null,
		statusCode: {
			200: function() {
				launchModal('Фотография успешно удалена');
				if($('.photoScrollArrow').get(1)) return $('.photoScrollArrow').eq(1).trigger('click');
				if($('.photoScrollArrow').get(0)) return $('.photoScrollArrow').eq(0).trigger('click');
				//предусмотреть, что произойдет, если у пользователя не осталось фотографий после удаления
			},
			403: function() {
				launchModal('Ошибка! Вам запрещена эта операция')
			},
			404: function() {
				launchModal('Ошибка! В Вашей коллекции нет такой фотографии')
			},
			500: function() {
				launchModal('Ошибка! Что-то пошло не так!')
			}
		}
	});
}

function transformDivToInput(elem, id) {
	var parent = elem.parentNode;
	elem.parentNode.removeChild(elem);
	var area = document.createElement('textarea');
	if (elem.innerHTML != 'Редактировать описание') area.value = elem.innerHTML;
	area.placeholder = 'Введите описание';
	area.className = 'description';
	area.onblur = function() {
		transformInputToDiv(this, id);
	}
	area.name = 'description';
	parent.appendChild(area);
	area.focus();
}

function transformInputToDiv(elem, id) {
	var parent = elem.parentNode;
	var div = document.createElement('div');
	$.ajax({
		url: '/user/photoDescription/'+id,
		method: 'POST',
		data: $('#contentDescription').serialize(),
		statusCode: {
			200: function(jqXHR) {
				div.innerHTML = jqXHR;
				if (jqXHR == '') {
					div.innerHTML = "Редактировать описание";
				}
			},
			404: function () {
				launchModal('Фотография не найдена!');
			},
			403: function () {
				launchModal('Вам запрещена данная операция');
			},
			500: function () {
				launchModal('Ошибка! Что-то пошло не так.');
			}
		}
	});
	div.onclick = function() {
		transformDivToInput(this, id);
	}
	elem.parentNode.removeChild(elem);
	parent.appendChild(div);
}

function comment(form, type, id) {
	var message = form.children[0].value;
	form.children[0].value = "";
	socket.emit('comment', message, type, id);
	return false;
}

function buildPostRequest (data, boundary) {
	var boundaryMiddle = '--'+boundary+'\r\n';
	var boundaryLast = '--'+boundary+'--\r\n';
	var body = ['\r\n'];
	for (var key in data) {
	    body.push('Content-Disposition: form-data; name="'+key+'"\r\n\r\n'+data[key]+'\r\n');}
	body = body.join(boundaryMiddle)+boundaryLast;
	return body;
	
}

function remarkComment(elem, type, id, i) {
	var message = elem.parentNode.parentNode.children[1].innerHTML;
	elem.parentNode.parentNode.children[1].innerHTML = "";
	elem.disabled = true;
	var form = document.createElement('form');
	form.onsubmit = function(){return false}
	form.className = 'comment';
	elem.parentNode.parentNode.children[1].appendChild(form);
	
	var area = document.createElement('textarea');
	area.innerHTML = message.replace(/<br>/g, "\n");;
	area.className = 'form-control';
	form.appendChild(area);
	
	var button = document.createElement('input');
	button.type = "submit";
	button.value = "Сохранить";
	button.className = "btn btn-primary";
	button.onclick = function() {
		socket.emit('comment remark', area.value, type, id, i);
		form.parentNode.parentNode.removeChild(form.parentNode);
		elem.disabled = false;
	}
	form.appendChild(button);
	
	
}
