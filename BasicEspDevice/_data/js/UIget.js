var webConfigData = new Object();

	webConfigData.wifi_sta=new Object();
	webConfigData.wifi_ap=new Object();
	webConfigData.ftp=new Object();
	webConfigData.ntp=new Object();
	webConfigData.ntp.server=new Array;
	webConfigData.alarms_global = new Object();
	webConfigData.alarms_global.sunrisestartcolor = new Object();
	webConfigData.alarms_global.sunriseendcolor = new Object();
	webConfigData.alarms = new Object();	

//From https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLampStatus () {
	let data = new Object ();
	data.lamp_status = new Object();
	data.lamp_status.status = +$('#LAMPonoffswitch').prop("checked");
	data.lamp_status.mode = $('#lampMode').val();
	data.lamp_status.color = hexToRgb($('#lampColor').val());
	data.lamp_status.brightness = Math.ceil($("#lampBrightness").val()*255/100);
	console.log(JSON.stringify(data));
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

function getFTP () {
	webConfigData.ftp.start=+$('#FTPonoffswitch').prop("checked");
	webConfigData.ftp.name=$('#FTPName').val();
	webConfigData.ftp.password=$('#FTPPassword').val();
}

function getNTP () {
	webConfigData.ntp.server=[];
	$('.ntp_servers_input').children().each(function() {		
		if ($(this).children('input').val().length>0) {
			webConfigData.ntp.server.push($(this).children('input').val());
		}
	});	
	webConfigData.ntp.timezone=parseInt($('#NTPtimezone').val())*3600;
	webConfigData.ntp.tries=parseInt($('#NTPTries').val());
	webConfigData.ntp.time_update=parseInt($('#NTPTimeUpdate').val());
	webConfigData.ntp.udp_resend=parseInt($('#NTPUdpResend').val());
}

function getAlarmsGlobal() {
	webConfigData.alarms_global.sunrisebegin=parseInt($('#sunRiseDuration').val());
	webConfigData.alarms_global.solstice=parseInt($('#solsticeDuration').val());
	webConfigData.alarms_global.sunrisestartcolor = hexToRgb($('#sunRiseStartColor').val());
	webConfigData.alarms_global.sunriseendcolor = hexToRgb($('#sunRiseEndColor').val());
	webConfigData.alarms_global.sunrisestartbrightness=parseInt($('#sunRiseStartBrightness').val());
	webConfigData.alarms_global.sunriseendbrightness=parseInt($('#sunRiseEndBrightness').val());
}

function getAlarmsList() {
	let alarms = [];
	$.each($('.alarm_row'), function (index, alarm_row) {
		let alarm = new Object;
		alarm.type=$(alarm_row).find('.alarm_type').val();
		alarm.hour=parseInt($(alarm_row).find('input[type=time]').val().substr(0,2));
		alarm.minute=parseInt($(alarm_row).find('input[type=time]').val().substr(3,5));
		if (alarm.type=="weekly") {
		 let weekdays=[];
		 weekdays.push(0+$(alarm_row).find('.Monday').prop("checked"));
		 weekdays.push(0+$(alarm_row).find('.Tuesday').prop("checked"));
		 weekdays.push(0+$(alarm_row).find('.Wednesday').prop("checked"));
		 weekdays.push(0+$(alarm_row).find('.Thursday').prop("checked"));
		 weekdays.push(0+$(alarm_row).find('.Friday').prop("checked"));
		 weekdays.push(0+$(alarm_row).find('.Saturday').prop("checked"));
		 weekdays.push(0+$(alarm_row).find('.Sunday').prop("checked"));
		 alarm.weekdays=weekdays;
		}		
		alarm.active=0+$(alarm_row).find('.onoffswitch-checkbox').prop("checked");
		alarms.push(alarm);
	});
	webConfigData.alarms=alarms;
}

function getWebConfigData () {
	getWiFiSTA();
	getWiFiAP();
	getFTP();
	getNTP();
	getAlarmsGlobal();
	getAlarmsList();
}