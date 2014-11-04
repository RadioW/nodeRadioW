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
