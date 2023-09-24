var webConfigData = new Object();

	webConfigData.wifi_sta=new Object();
	webConfigData.wifi_ap=new Object();
	webConfigData.ntp=new Object();
	/*webConfigData.ftp=new Object();
	webConfigData.light=new Object();*/



function getLightStatus () {
	let data = new Object ();
	data.light_status = new Object();
	data.light_status.status = +$('#lightonoffswitch').prop("checked");
	data.light_status.autoOnOff = +$('#lightAutoOnOff').prop("checked");
	data.light_status.brightness = Math.ceil($("#lightBrightness").val()*1023/100);
	data.light_status.autoBrightness = +$('#lightAutoBrightness').prop("checked");
	
	return JSON.stringify(data);
}



//getConfig
function getWiFiSTA () {	
	webConfigData.wifi_sta.hostname=$('#DeviceName').val();
	webConfigData.wifi_sta.name=$('#WiFiName').val();
	webConfigData.wifi_sta.password=$('#WiFiPassword').val();
	webConfigData.wifi_sta.tries=parseInt($('#WiFiTries').val());	
}

function getWiFiAP () {
	webConfigData.wifi_ap.name=$('#APName').val();
	webConfigData.wifi_ap.password=$('#APPassword').val();	
}

function getNTP () {
  webConfigData.ntp.timezonefrom=$('input[name="ntpoffset"]:checked').val()
  webConfigData.ntp.offset=$('#APName').val()
}

/*
function getFTP () {
	webConfigData.ftp.start=+$('#FTPonoffswitch').prop("checked");
	webConfigData.ftp.name=$('#FTPName').val();
	webConfigData.ftp.password=$('#FTPPassword').val();
}

function getLight () {
	webConfigData.light.autoOffAfterMove = $('#autoOffAfterMove').val();
	webConfigData.light.autoMinBrightness =  Math.ceil($("#autoMinBrightness").val()*1023/100);
	webConfigData.light.autoOnOffAfterManualOnFlag = +$('#autoOnOffAfterManualOnFlag').prop("checked");
	webConfigData.light.autoOnOffAfterManualOn = $('#autoOnOffAfterManualOn').val()*60;
	webConfigData.light.autoOnOffAfterManualOffFlag = +$('#autoOnOffAfterManualOffFlag').prop("checked");
	webConfigData.light.autoOnOffAfterManualOff = $('#autoOnOffAfterManualOff').val()*60;
	webConfigData.light.onOffLuxLimit = $('#onOffLuxLimit').val();
	webConfigData.light.luxMin = $('#luxMin').val();
	webConfigData.light.luxMax = $('#luxMax').val();
}*/


function getWebConfigData () {
	getWiFiSTA();
	getWiFiAP();
	getNTP();
	/*getFTP();
	getLight();*/
}