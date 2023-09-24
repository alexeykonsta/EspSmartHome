var reboot = 0;

$(function(){
    $('.menu_item_body').hide();
    $menu_title = $('h3.menu_item_title ');
    $menu_title.on('click', function(event) {
      event.preventDefault();
      $menu_title.not(this).next().slideUp(500);
      $(this).next().slideToggle(500);
    });
});

$( document ).ready(function() {	
  //getFullConfigFromDevice();
	
	$("#settings").on( "input", function () {
		checkNewConfigData();
	});

	$("#save_button").on( "click", function () {
		saveNewConfigData();
	});
	
	$("#reload_button").on( "click", function () {
		clickReloadButton();
	});
	
	$(".showPassword").on( "change", function () {
		showPassword(this);	
	});
	
	/*
	$("#ManualUpdate").on( "change", function () {
		if ($("#ManualUpdate").val() == "") 
			$("#update_by_file_button").prop("disabled", true);
		else $("#update_by_file_button").prop("disabled", false);
	});

	$("#update_by_file_button").on( "click", function () {
		updateByFile($('#ManualUpdate').prop('files')[0]);
	});		
	
	$("#autoOnOffAfterManualOnFlag").on( "change", function () {
		enableAutoOnOffAfterManualOn();
	});
	
	$("#autoOnOffAfterManualOffFlag").on( "change", function () {
		enableAutoOnOffAfterManualOff();
	});
	
	$("#lightonoffswitch").on( "input", function () {
		$('#lightAutoOnOff').prop("checked", false);
	});
	
	$("#lightBrightnessNum").on( "input", function () {
		$('#lightAutoBrightness').prop("checked", false);
	});

	$("#lightBrightness").on( "input", function () {
		$('#lightAutoBrightness').prop("checked", false);
	});	
	
	
	$("#light_control").on( "input", function () {
		//if ($("#lightonoffswitch").is(':checked')==true && )
			if ($("#light_control")[0].checkValidity() == true) {
				sendLightStatus();
			}
	});	
	
	$("#lightBrightness").on( "input", function () {
			displayLightBrightness();
	});	
	$("#lightBrightnessNum").on( "input", function () {
			rangeLightBrightness();
	});
*/
});

/*function getFullConfigFromDevice () {
  let min_window_size = Math.min($(window).height(), $(window).width());
	$.blockUI({ message: '<img src="img/loader.gif" class="block-gif"/>' ,
							css: { 
									top:  ($(window).height() - min_window_size*0.4) /2 + 'px', 
									left: ($(window).width() - min_window_size*0.4) /2 + 'px', 
									width: min_window_size*0.4+'px',
									height: min_window_size*0.4+'px',
									backgroundColor: 'transparent',
									border: '0px',
									opacity: 0.8
							} 	
	});  
  
	$.ajax({
			type: 'GET',
			url: '/fullconfig',
			headers: {'Content-Type': 'text/plain'},
			error:  function(xhr, str){
				console.log('Возникла ошибка при запросе на конфигурации устройства: ' + xhr.responseCode);
			},		
			success: function(data) {
			  console.log({data});
			  console.log(data.ntp);
			  fillWiFiSTA(data.wifi_sta);
			  fillWiFiAP(data.wifi_ap);
			  fillNTP(data.ntp);
			  $.unblockUI();
				
			}
		});  
}*/

/*Compare data*/
//Object compare from https://gist.github.com/nicbell/6081098
Object.compare = function (obj1, obj2) {
	//Loop through properties in object 1
	for (var p in obj1) {
		//Check property exists on both objects
		if (obj2 === undefined || obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
 
		switch (typeof (obj1[p])) {
			//Deep compare objects
			case 'object':
				if (!Object.compare(obj1[p], obj2[p])) return false;
				break;
			//Compare function code
			case 'function':
				if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
				break;
			//Compare values
			default:
				if (obj1[p] != obj2[p]) return false;
		}
	}
 
	//Check object 2 for any extra properties
	for (var p in obj2) {
		if (obj1 === undefined || typeof (obj1[p]) == 'undefined') return false;
	}
	return true;
};

function checkNewConfigData () {
	getWebConfigData();

	if (Object.compare(webConfigData, configData) == false /*&& $("#settings")[0].checkValidity() == true*/) {
		$(".save_button").prop("disabled", false);
	} else {
		$(".save_button").prop("disabled", true);
	}

}

function saveNewConfigData () {
	let save = new Object();
	
	if (Object.compare(webConfigData.wifi_sta, configData.wifi_sta) == false) {
		reboot = reboot + 1;
		save.wifi_sta = new Object();
		save.wifi_sta = webConfigData.wifi_sta;
	}		
	if (Object.compare(webConfigData.wifi_ap, configData.wifi_ap) == false) {
		reboot = reboot + 1;
		save.wifi_ap = new Object();
		save.wifi_ap = webConfigData.wifi_ap;		
	}	
	if (Object.compare(webConfigData.ftp, configData.ftp) == false) {
		reboot = reboot + 1;
		save.ftp = new Object();
		save.ftp = webConfigData.ftp;		
	}
	if (Object.compare(webConfigData.light, configData.light) == false) {
		reboot = reboot + 1;
		save.light = new Object();
		save.light = webConfigData.light;		
	}	

	let min_window_size = Math.min($(window).height(), $(window).width());
	$.blockUI({ message: '<img src="img/loader.gif" class="block-gif"/>' ,
							css: { 
									top:  ($(window).height() - min_window_size*0.4) /2 + 'px', 
									left: ($(window).width() - min_window_size*0.4) /2 + 'px', 
									width: min_window_size*0.4+'px',
									height: min_window_size*0.4+'px',
									backgroundColor: 'transparent',
									border: '0px',
									opacity: 0.8
							} 	
	});
	let ObjectToSend = new Object();
	ObjectToSend.save = save;
	console.log(ObjectToSend);
	ws.send(JSON.stringify(ObjectToSend));
}

//show password
function showPassword (show_password_checkbox) {	
	if ($(show_password_checkbox).is(':checked')==true) {
		$(show_password_checkbox).parent().parent().prev().children('input').attr('type', 'text');
	} else {
		$(show_password_checkbox).parent().parent().prev().children('input').attr('type', 'password');
	}
}

function clickReloadButton () {
  if (reboot != 0) {
    text = "Есть несохранённые изменения \nПосле перезагрузки устройства, страница обновится автоматически. \nПерезагрузить сейчас?";
  } else {
    text = "После перезагрузки устройства, страница обновится автоматически. \nПерезагрузить сейчас?" 
  }
  
  if(confirm(text)) {
    sendReloadRequest();
  }
}

function sendReloadRequest () {
  clearInterval (webSocketTimer);
	$.ajax({
			type: 'GET',
			url: '/reboot',
			headers: {'Content-Type': 'text/plain'},
			error:  function(xhr, str){
				console.log('Возникла ошибка при запросе на перезагрузку устройства: ' + xhr.responseCode);
			},		
			success: function(data) {
				let min_window_size = Math.min($(window).height(), $(window).width());
				$.blockUI({ message: '<img src="img/loader.gif" class="block-gif"/>' ,
										css: { 
												top:  ($(window).height() - min_window_size*0.4) /2 + 'px', 
												left: ($(window).width() - min_window_size*0.4) /2 + 'px', 
												width: min_window_size*0.4+'px',
												height: min_window_size*0.4+'px',
												backgroundColor: 'transparent',
												border: '0px',
												opacity: 0.8
										} 	
				});
				let pingTimer = setInterval (pingHost, 3000);
			}
		});				
}

function pingHost () {
	$.ajax({
			type: 'GET',
			url: '/ping',
			headers: {'Content-Type': 'text/plain'},
			success: function(data) {
				//$.unblockUI();
				window.location.reload();
			}
		});	
}

function enableAutoOnOffAfterManualOn () {
	if ($("#autoOnOffAfterManualOnFlag").is(':checked')==true) {
		$("#autoOnOffAfterManualOn").prop('disabled', false)
	} else {
		$("#autoOnOffAfterManualOn").prop('disabled', true)
	}
}

function enableAutoOnOffAfterManualOff () {
	if ($("#autoOnOffAfterManualOffFlag").is(':checked')==true) {
		$("#autoOnOffAfterManualOff").prop('disabled', false);
	} else {
		$("#autoOnOffAfterManualOff").prop('disabled', true);
	}
}

function displayLightBrightness () {
	$("#lightBrightnessNum").val($("#lightBrightness").val());
}

function rangeLightBrightness () {
	$("#lightBrightness").val($("#lightBrightnessNum").val());
}

function updateByFile (file) {
	let data = new FormData();	
	data.append("update", file);
	data.append("methodNmae", "fileSend");
	if(confirm("Устройство будет перезагружено для перепрошивки.\nСтраница обновится автоматически после перепрошивки.\nПродолжить?")) {
		let min_window_size = Math.min($(window).height(), $(window).width());
		clearInterval(webSocketTimer);
		$.blockUI({ message: '<img src="img/loader.gif" class="block-gif"/>' ,
								css: { 
										top:  ($(window).height() - min_window_size*0.4) /2 + 'px', 
										left: ($(window).width() - min_window_size*0.4) /2 + 'px', 
										width: min_window_size*0.4+'px',
										height: min_window_size*0.4+'px',
										backgroundColor: 'transparent',
										border: '0px',
										opacity: 0.8
								} 	
		});			
		$.ajax({
			url: './update',
			type: 'POST',
			data: data,
			cache: false,
			processData: false,
			contentType: false,
			success: function( respond, textStatus, jqXHR ){
				if( typeof respond.error === 'undefined' ){
					let pingTimer = setInterval (pingHost, 2000);
				}
				else{
						$.unblockUI();
						alarm('ОШИБКИ ОТВЕТА сервера: ' + respond.error );
				}
			},
			error: function( jqXHR, textStatus, errorThrown ){
				$.unblockUI();
				alarm('ОШИБКИ AJAX запроса: ' + textStatus );
			}
		});
	}
}