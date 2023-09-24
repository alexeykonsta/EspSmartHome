var ws = new WebSocket('ws://'+location.hostname+':81/'/*, ['arduino']*/);
var webSocketPause = 0;
var webSocketOpened = false;
const webSocketPauseLimit = 4;
var webSocketTimer = setInterval (increasePause, 1000);

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function increasePause () {
	if (webSocketOpened) {
		webSocketPause++;
		if (webSocketPause > webSocketPauseLimit) {
			ws.close();
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
	if (typeof data.wifi_sta != "undefined") fillWiFiSTA(data.wifi_sta);
	if (typeof data.wifi_ap != "undefined") fillWiFiAP(data.wifi_ap);
	if (typeof data.ftp != "undefined") fillFTP(data.ftp);
	if (typeof data.ntp != "undefined") fillNTP(data.ntp);
	if (typeof data.alarms_global != "undefined") fillAlarmsGlobal(data.alarms_global);
	if (typeof data.alarms != "undefined") fillAlarmsList(data.alarms);
	if (typeof data.lamp_status != "undefined") fillLampStatus(data.lamp_status);	
	
	if (typeof data.date != "undefined") $("#date").text(data.date);	
	if (typeof data.time != "undefined") $("#time").text(data.time);
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
	
}

ws.onopen = function(e) {
	webSocketOpened = true;
	webSocketPause = 0;
	console.log("WebSocket opened");
};

ws.onmessage = function (event) {
	webSocketPause = 0;
	wsMessageType(event.data);
};

ws.onclose = function (event) {
	webSocketOpened = false;	
	if (confirm("Соединение потеряно. Нет данных с устройства более " + webSocketPauseLimit +" секунд. \nСтраница перестала синхронизироваться с устройством и устарела. \nОбновить страницу, когда устройство снова будет доступно?")) {
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

ws.onerror = function(error) {
	alert(`[error] ${error.message}`);
};


function sendLampStatus() {
	ws.send(getLampStatus());
}
