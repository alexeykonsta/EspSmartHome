var ws = new WebSocket('ws://'+location.hostname+location.pathname);
var webSocketPause = 0;
var webSocketOpened = false;
const webSocketPauseLimit = 4;
var webSocketTimer = setInterval (increasePause, 1000);

var log_output = 1;
var log_status = 1;
var log_ping = 0;

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
	//console.log(data);


  //log or not
	if (typeof data.ping != "undefined" && log_ping != 0) console.log(data);
	if ((  typeof data.wifi_sta != "undefined"
	    || typeof data.wifi_ap  != "undefined"
	    || typeof data.ntp      != "undefined")
	    && log_output != 0) console.log(data);
	if ((  typeof data.rssi     != "undefined"
	    || typeof data.date     != "undefined"
	    || typeof data.time     != "undefined"
	    || typeof data.uptime   != "undefined"
	    || typeof data.freeheap != "undefined")
	    && log_status != 0) console.log(data);
	    
	
	
	if (typeof data.logger != "undefined") {
	  for (i in data.logger) {
	    $("#content").append($( "<p class='logger col-11 col-lg-8' >"+data.logger[i]+"</p>" ));
	  }
	}
	
	if (typeof data.wifi_sta  != "undefined")        fillWiFiSTA(data.wifi_sta);
	if (typeof data.wifi_ap   != "undefined")        fillWiFiAP(data.wifi_ap);
	if (typeof data.ntp       != "undefined")        fillNTP(data.ntp);
	
	if (typeof data.rssi      != "undefined")        fillRSSI(data.rssi);
	if (typeof data.date      != "undefined")        fillDate(data.date);
	if (typeof data.time      != "undefined")        fillTime(data.time);
	if (typeof data.uptime    != "undefined")        fillUptime(data.uptime);
	if (typeof data.freeheap  != "undefined")        fillFreeHeap(data.freeheap);
	
	
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
