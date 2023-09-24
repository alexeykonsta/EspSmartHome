var configData = new Object();

configData.wifi_sta = new Object();
configData.wifi_ap = new Object();
configData.ntp = new Object();
/*
configData.ftp = new Object();
configData.light = new Object();
*/

function fillWiFiSTA(data) {
	configData.wifi_sta = data;
	$('#WiFiName').val(data.name);
	$('#WiFiPassword').val(data.password);
	$('#WiFiTries').val(data.tries);
	$('#DeviceName').val(data.hostname);
}

function fillWiFiAP(data) {
	configData.wifi_ap = data;
	$('#APName').val(data.name);
	$('#APPassword').val(data.password);
}

function fillNTP(data) {
  configData.ntp = data;
  $('input[name="ntpoffset"][value='+data.timezonefrom+']').prop('checked', true);
  $('#ntpoffset').val(data.offset);
}

function fillRSSI(data) {
  if (data !=$('#rssi').text()) {
	   $('#rssi').text(data);
	   if       ((data) < -107)  $('#rssi').css("color", "rgb(225, 120, 120)");
	   else if  ((data) < -93)   $('#rssi').css("color", "rgb(225, 140, 0)");
	   else if  ((data) < -85)   $('#rssi').css("color", "rgb(225, 225, 120)");
	   else if  ((data) < -75)   $('#rssi').css("color", "rgb(180, 225, 180)");
	   else if  ((data) >= -75)  $('#rssi').css("color", "rgb(120, 225, 120)");  
  }
}

function fillDate(data) {
  $('#date').text(data);
  
}

function fillTime(data) {
  $('#time').text(data);
}

function fillUptime(data) {
  $('#uptime').text(data);
}

function fillFreeHeap(data) {
  if (data != $('#freeheap').text()) $('#freeheap').text(data);
}









/*function fillFTP(data) {
	configData.ftp = data;	
	$('#FTPonoffswitch').prop("checked", data.start);
	$('#FTPName').val(data.name);
	$('#FTPPassword').val(data.password);
}

function fillLight(data) {
	configData.light = data;
	$('#autoOffAfterMove').val(data.autoOffAfterMove);
	$('#autoMinBrightness').val(data.autoMinBrightness);	
	$('#autoOnOffAfterManualOnFlag').prop("checked", data.autoOnOffAfterManualOnFlag);
	$('#autoOnOffAfterManualOn').val(data.autoOnOffAfterManualOn/60);
	$('#autoOnOffAfterManualOffFlag').prop("checked", data.autoOnOffAfterManualOffFlag);
	$('#autoOnOffAfterManualOff').val(data.autoOnOffAfterManualOff/60);
	$('#onOffLuxLimit').val(data.onOffLuxLimit);
	$('#luxMin').val(data.luxMin);
	$('#luxMax').val(data.luxMax);	
	
	enableAutoOnOffAfterManualOn();
	enableAutoOnOffAfterManualOff();
}


function fillLightStatus(data) {
	$('#lightonoffswitch').prop("checked", data.status);
	$('#lightAutoOnOff').prop("checked", data.autoOnOff);
	$('#lightBrightness').val(data.brightness);
	$('#lightBrightnessNum').val(data.brightness);
	$('#lightAutoBrightness').prop("checked", data.autoBrightness);
}

function fillDeviceStatus(data) {
	$('#lastMoveDetected').text(data.lastMoveDetected);
	$('#lightSensor').text(data.lightSensor);
	$('#lightAutoOffAfterMove').text(data.lightAutoOffAfterMove);
	$('#lightMakeAutoOnOff').text(data.lightMakeAutoOnOff);
	$('#rssi').text(data.rssi);
	$('#time').text(data.time);
}*/