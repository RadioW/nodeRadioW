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
}
function datify(timestamp, dateOnly) {
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
    if (dateOnly) {
        return day+" "+month+" "+year;
    } else {
        return day + " " + month + " " + year + " в " + hour + ":" + minute;
    }
}

function launchModal(message) {
	$('#errorModalMessage').html(message);
	$('#errorModal').modal();
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

function buildPostRequest (data, boundary) {
	var boundaryMiddle = '--'+boundary+'\r\n';
	var boundaryLast = '--'+boundary+'--\r\n';
	var body = ['\r\n'];
	for (var key in data) {
	    body.push('Content-Disposition: form-data; name="'+key+'"\r\n\r\n'+data[key]+'\r\n');}
	body = body.join(boundaryMiddle)+boundaryLast;
	return body;
	
}
