var configData = new Object();

configData.wifi_sta = new Object();
configData.wifi_ap = new Object();
configData.ftp = new Object();
configData.ntp = new Object();
configData.ntp.servers = new Array;
configData.alarms_global = new Object;
configData.alarms = new Object;

//From https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgbs
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

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

function fillFTP(data) {
	configData.ftp = data;	
	$('#FTPonoffswitch').prop("checked", data.start);
	$('#FTPName').val(data.name);
	$('#FTPPassword').val(data.password);
}

function fillNTP(data) {
	configData.ntp = data;
	$('#NTP_server_1').val(data.server[0]);
	$('#NTP_server_2').val(data.server[1]);
	$('#NTP_server_3').val(data.server[2]);
	$('#NTPtimezone').val(data.timezone/3600);
	$('#NTPTries').val(data.tries);
	$('#NTPTimeUpdate').val(data.time_update);
	$('#NTPUdpResend').val(data.udp_resend);
}

function fillAlarmsGlobal(data) {
	configData.alarms_global = data;
	$('#sunRiseDuration').val(data.sunrisebegin);
	$('#solsticeDuration').val(data.solstice);
	$('#sunRiseStartColor').val(rgbToHex(data.sunrisestartcolor.r, data.sunrisestartcolor.g, data.sunrisestartcolor.b));
	$('#sunRiseEndColor').val(rgbToHex(data.sunriseendcolor.r, data.sunriseendcolor.g, data.sunriseendcolor.b));
	$('#sunRiseStartBrightness').val(data.sunrisestartbrightness);
	$('#sunRiseEndBrightness').val(data.sunriseendbrightness);
	changeSunRiseAlarmGradient();
}

function fillAlarmsList(alarms) {
	configData.alarms = alarms;
	if (alarms.length>0) {
		$.each(alarms, function(index, alarms){
			add_alarm();
			$(".alarm_type").last().val(alarms.type).change();
			
			if (alarms.type=="weekly") {
				if (alarms.weekdays[0]==1)
					$(".Monday").last().prop("checked", 1);
				if (alarms.weekdays[1]==1)
					$(".Tuesday").last().prop("checked", 1);
				if (alarms.weekdays[2]==1)
					$(".Wednesday").last().prop("checked", 1);
				if (alarms.weekdays[3]==1)
					$(".Thursday").last().prop("checked", 1);
				if (alarms.weekdays[4]==1)
					$(".Friday").last().prop("checked", 1);
				if (alarms.weekdays[5]==1)
					$(".Saturday").last().prop("checked", 1);
				if (alarms.weekdays[6]==1)
					$(".Sunday").last().prop("checked", 1);
			}
			
			let time="";
			if (alarms.hour<10) time=time+"0";
			time=time+alarms.hour+":";
			if (alarms.minute<10) time=time+"0";
			time=time+alarms.minute;

			$("input[type=time]").last().val(time);
			
			$("input[id^=onoffswitch]").last().prop("checked", alarms.active);	
		})
	}	
}

function fillLampStatus(data) {
	$('#LAMPonoffswitch').prop("checked", data.status);
	$('#lampMode').val(data.mode);
	hide_show_lamp_color();	
	$('#lampColor').val(rgbToHex(data.color.r, data.color.g, data.color.b));
	$("#lampBrightness").val(data.brightness)
	$("#lampBrightnessNum").val(data.brightness)
}