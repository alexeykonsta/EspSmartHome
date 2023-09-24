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
	$("#settings").on( "input", function () {
		checkNewConfigData();
	});
	$(".add_alarm_button").on( "click", function () {
		add_alarm();
		checkNewConfigData();
	});

	$(".save_button").on( "click", function () {
		saveNewConfigData();
	});	
	
	$(".showPassword").on( "change", function () {
		showPassword(this);	
	});
	$("#lampBrightness").on( "input", function () {
			displayLampBightness();
			if ($("#lamp_control")[0].checkValidity() == true) {sendLampStatus()};
	});	
	$("#lampBrightnessNum").on( "input", function () {
			rangeLampBightness();
			if ($("#lamp_control")[0].checkValidity() == true) {sendLampStatus()};
	});
	$("#sunRiseStartColor").on( "input", function () {
		changeSunRiseAlarmGradient();
	});
	$("#sunRiseEndColor").on( "input", function () {
		changeSunRiseAlarmGradient();
	});
	
});

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

	if (Object.compare(webConfigData, configData) == false && $("#settings")[0].checkValidity() == true) {
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
	if (Object.compare(webConfigData.ntp, configData.ntp) == false) {
		reboot = reboot + 1;
		save.ntp = new Object();
		save.ntp = webConfigData.ntp;		
	}	
	if (Object.compare(webConfigData.alarms_global, configData.alarms_global) == false) {
		reboot = reboot + 1;
		save.alarms_global = new Object();
		save.alarms_global = webConfigData.alarms_global;		
	}	
	if (Object.compare(webConfigData.alarms, configData.alarms)	== false) {
		save.alarms = new Object();
		save.alarms = webConfigData.alarms;		
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
		$(show_password_checkbox).parent().parent().prev().children('input').attr('type', 'text')
	} else {
		$(show_password_checkbox).parent().parent().prev().children('input').attr('type', 'password');
	}
}

function changeSunRiseAlarmGradient () {
	startColor 			= hexToRgb($("#sunRiseStartColor").val());
	endColor 				= hexToRgb($("#sunRiseEndColor").val());
	startBrightness = $("#sunRiseStartBrightness").val()/100;
	endBrightness 	= $("#sunRiseEndBrightness").val()/100;
	$(".gradient").css({
		background: "linear-gradient(90deg, "+
		"rgb("+Math.ceil(startColor.r*startBrightness)+", "+Math.ceil(startColor.g*startBrightness)+", "+Math.ceil(startColor.b*startBrightness)+"), "+
		"rgb("+Math.ceil(endColor.r*endBrightness)+", "+Math.ceil(endColor.g*endBrightness)+", "+Math.ceil(endColor.b*endBrightness)+"))"
});
}

function hide_show_lamp_color () {
	if ($('#lampMode').val() == "1") $('#lampColor').parent().parent().show();
	else $('#lampColor').parent().parent().hide();
}

function displayLampBightness () {
	$("#lampBrightnessNum").val($("#lampBrightness").val());
}

function rangeLampBightness () {
	$("#lampBrightness").val($("#lampBrightnessNum").val());
}

//alarms
function generate_alarm_title () {
	let alarm_counter=$('.alarm_row').length;
	let alarm_menu_title=$('.add_alarm_button').closest('.menu_item').children('h3').text();
	let new_title=alarm_menu_title.substr(0, (alarm_menu_title.indexOf('(')+1)) 
					+ (alarm_counter) 
					+ alarm_menu_title.substr(alarm_menu_title.indexOf('(')+1 + 1);
	$('.add_alarm_button').closest('.menu_item').children('h3').text(new_title);
	$('.add_alarm_button').closest('.menu_item').children('h3').append('<img class="hint_img" src="img/hint.png">');
}

function add_alarm() {
	let alarm_counter=$('.alarm_row').length;
	let max_id=0;
	
	if ($("input[id^=onoffswitch]").length==0) {
		max_id=0;
	} else {
		if (isNaN(parseInt($("input[id^=onoffswitch]").last().attr('id').substr(11)))) {
			max_id=0;
		} else {
			max_id=parseInt($("input[id^=onoffswitch]").last().attr('id').substr(11))			
		}	
	}
	
	if (alarm_counter<5) {
		
		alarm_html_code='<div class="row alarm_row gray-border">';
		alarm_html_code+='	<span class="row_title col-lg-3 col-sm-12">';
		alarm_html_code+='		<span class="alarm_title">';
		alarm_html_code+='			<select class="alarm_type" onchange="hide_show_weekdays(this)">';
		alarm_html_code+='				<option value="ones">Один раз</option>';
		alarm_html_code+='				<option value="weekly">Каждую неделю</option>';
		alarm_html_code+='			</select>';
		alarm_html_code+='		</span>';
		alarm_html_code+='	</span>';
		alarm_html_code+='	<span class="row_input row_alarm_input col-lg-9 col-sm-12">';
		alarm_html_code+='		<span class="alarm_time col-lg-3 col-sm12">';
		alarm_html_code+='			<input type="time" pattern="[0-9]{2}:[0-9]{2}" value="06:00">';
		alarm_html_code+='		</span>';
		alarm_html_code+='			<span class="alarm_weekdays col-lg-6 col-sm12">';
		alarm_html_code+='				<span class="alarm_weekdays_border'+/* col-lg-12 col-sm12*/'">';
		alarm_html_code+='					<span class="alarm_workdays'+/* col-lg-7 col-sm11*/'">';
		alarm_html_code+='						<label><input type="checkbox" class="Monday">Пн</label>';
		alarm_html_code+='						<label><input type="checkbox" class="Tuesday">Вт</label>';
		alarm_html_code+='						<label><input type="checkbox" class="Wednesday">Ср</label>';
		alarm_html_code+='						<label><input type="checkbox" class="Thursday">Чт</label>';
		alarm_html_code+='						<label><input type="checkbox" class="Friday">Пт</label>';
		alarm_html_code+='					</span>';
		alarm_html_code+='					<span class="alarm_weekend'+/* col-lg-4 col-sm11*/'">';
		alarm_html_code+='						<label><input type="checkbox" class="Saturday">Сб</label>';
		alarm_html_code+='						<label><input type="checkbox" class="Sunday">Вс</label>';
		alarm_html_code+='					</span>';
		alarm_html_code+='				</span>';
		alarm_html_code+='			</span>';		
		alarm_html_code+='		<span class="alarm_buttons col-lg-3 col-sm12">';
		alarm_html_code+='			<span class="onoffswitch">';
		alarm_html_code+='				<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="onoffswitch'+(max_id+1)+'">';
		alarm_html_code+='				<label class="onoffswitch-label" for="onoffswitch'+(max_id+1)+'">';
		alarm_html_code+='					<span class="onoffswitch-inner"></span>';
		alarm_html_code+='				</label>';
		alarm_html_code+='			</span>';
		alarm_html_code+='			<span class="onoffswitch">';
		alarm_html_code+='				<button type="button" class="alarm_del_button">';
		alarm_html_code+='					<img class="cross_img" src="img/cross.png">';
		alarm_html_code+='				</button>';
		alarm_html_code+='			</span>';
		alarm_html_code+='		</span>';
		alarm_html_code+='</div>';
	
		$(alarm_html_code).insertBefore($('.add_alarm_button').parent());
		$('.alarm_weekdays').last().children().hide();
		$("input[id^=onoffswitch]").last().prop("checked", true);	
		if (alarm_counter==4) {
			$('.add_alarm_button').prop('disabled', true);
		}
		
		generate_alarm_title();
		
	$(".alarm_del_button").last().on( "click", function () {
		delete_alarm(this);
		checkNewConfigData();
	});		
	}
}

function delete_alarm(button) {
	$(button).closest('.alarm_row').remove();
	$('.add_alarm_button').prop('disabled', false);
	
	generate_alarm_title();
}

function hide_show_weekdays (alarm_select) {
	let weekdays_block=$(alarm_select).parent().parent().parent().children('.row_alarm_input').children('.alarm_weekdays');
	
	if ($(alarm_select).val()=='ones') {
		weekdays_block.children().hide();
	}
	
	if ($(alarm_select).val()=='weekly') {
		weekdays_block.children().show();
	}
	
}

//save button
function changeSettings() {
	//CheckNewAlrmsData ();
	
	/*if (checkNewConfigData()) {
		$('.save_button').prop('disabled', false);
	} else {
		$('.save_button').prop('disabled', true);
	}*/
}
