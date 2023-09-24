



var ws = new WebSocket('ws://'+location.hostname+'/'/*, ['arduino']*/);
var wsLogger = new WebSocket('ws://'+location.hostname+'/logger')

var ws = new WebSocket('ws://'+location.hostname+location.pathname);
var webSocketPause = 0;
var webSocketOpened = false;
const webSocketPauseLimit = 4;
var webSocketTimer = setInterval (increasePause, 1000);
var log_output = 0;

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function increasePause () {
	if (webSocketOpened) {
		webSocketPause++;
		if (webSocketPause > webSocketPauseLimit) {
			ws.close();
			if (confirm("Соединение потеряно. Нет данных с устройства более " + String(Number(1)+ Number(webSocketPauseLimit)) +" секунд. \nСтраница перестала синхронизироваться с устройством и устарела. \nОбновить страницу, когда устройство снова будет доступно?")) {
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
				let pingTimer = setInterval (pingHost, 2000);
			}			
		};
	}
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

function wsMessageType (strData) {
	let data = JSON.parse(strData);

  console.log(data)
	/*
	if (typeof data.ping === "undefined" && typeof data.device_status === "undefined") console.log(data);
	if (typeof data.device_status != "undefined" && log_output == 1) console.log(data);
	

	if (typeof data.ftp != "undefined") fillFTP(data.ftp);
	if (typeof data.light != "undefined") fillLight(data.light);
	
	if (typeof data.light_status != "undefined") fillLightStatus(data.light_status);
	if (typeof data.device_status != "undefined") fillDeviceStatus(data.device_status);
	
	if (typeof data.brightness != "undefined") {
		$('#lightBrightness').val(data.brightness);
		$('#lightBrightnessNum').val(data.brightness);
	}
	if (typeof data.status != "undefined") {
		$('#lightonoffswitch').prop("checked", data.status);
	}
	if (typeof data.autoOnOff != "undefined") {
		$('#lightAutoOnOff').prop("checked", data.autoOnOff);
	}	
	
	if (typeof data.save != "undefined") {
		if (data.save == "OK") {
			sleep(1500).then(() => 
			{
				configData = JSON.parse(JSON.stringify(webConfigData));
				checkNewConfigData();
				$.unblockUI();
				if (reboot != 0) {
					if(confirm("Для вступления изменений в силу, необходимо перезагрузить устройство. \nПосле перезагрузки устройства, страница обновится автоматически. \nПерезагрузить сейчас?")) {
						clearInterval (webSocketTimer);
						$.ajax({
								type: 'POST',
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
					};
				} else {
					alert("Изменениня сохранены");
				}			
			});
		};
	};
	*/

	if (typeof data.wifi_sta != "undefined")        fillWiFiSTA(data.wifi_sta);
	if (typeof data.wifi_ap != "undefined")         fillWiFiAP(data.wifi_ap);
	if (typeof data.ntp != "undefined")             fillNTP(data.ntp);
	
	if (typeof data.rssi != "undefined" && data.rssi !=$('#rssi').text()) {
	   $('#rssi').text(data.rssi);
	   if       ((data.rssi) < -107)  $('#rssi').css("color", "rgb(225, 120, 120)");
	   else if  ((data.rssi) < -93)   $('#rssi').css("color", "rgb(225, 140, 0)");
	   else if  ((data.rssi) < -85)   $('#rssi').css("color", "rgb(225, 225, 120)");
	   else if  ((data.rssi) < -75)   $('#rssi').css("color", "rgb(180, 225, 180)");
	   else if  ((data.rssi) >= -75)  $('#rssi').css("color", "rgb(120, 225, 120)");
	};
	if (typeof data.date != "undefined" && data.date.replaceAll("/", ".") !=$('#date').text())       $('#date').text(data.date.replaceAll("/", "."));
	if (typeof data.time != "undefined")                                                             $('#time').text(data.time);
	if (typeof data.uptime != "undefined")                                                           $('#uptime').text(data.uptime);
	if (typeof data.freeheap != "undefined" && data.freeheap != $('#freeheap').text())               $('#freeheap').text(data.freeheap);
	
	
	
	//if (typeof data. != "undefined") {};
	/*{
    "rssi": -65,
    "date": "01/07/2023",
    "time": "17:42:56",
    "ntplastsync": 1688204107,
    "jsdatetime": "07/01/2023 17:42:56",
    "uptime": "   0 days 05:08:39",
    "freeheap": 25096
}*/
	
}

ws.onopen = function(e) {
	webSocketOpened = true;
	webSocketPause = 0;
  $("#header").text("Online");
  $("#header").css("background-color", "rgb(80, 95, 80)");	
	console.log("WebSocket opened");
};

ws.onmessage = function (event) {
	webSocketPause = 0;
	wsMessageType(event.data);
};

ws.onclose = function (event) {
  webSocketOpened = false;
  $("#header").text("Offline");
  $("#header").css("background-color", "rgb(105, 80, 80)");
  console.log("WebSocket closed");  
};

ws.onerror = function(error) {
	alert("Ошибка соединения: " + error.message);
};


function sendLightStatus() {
	ws.send(getLightStatus());
}
