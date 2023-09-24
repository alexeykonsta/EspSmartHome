#include "WiFiController.h"

bool WiFiController::_createConfigSTA		(const char path[]) { 
	/*
	{
		"wifi_sta": {
			"hostname": "",
			"name": "",
			"password": "",
			"tries": 3
		}
	}
	*/

	File configFile = LittleFS.open(path, "w");
	DynamicJsonDocument doc(1024);
	
	JsonObject root			= doc.to<JsonObject>();
	JsonObject wifi_sta		= root.createNestedObject("wifi_sta");
	wifi_sta["hostname"]	= "AlexESP";	
	wifi_sta["name"]		= "AnJ";
	wifi_sta["password"]	= "1234543214";
	wifi_sta["tries"]		= 3;
	
	if (serializeJson(doc, configFile) == 0) {
		_logger->logRow("		File wifi_sta: Save error");
		return 0;
	} else {
		_logger->logRow("		File wifi_sta: Created");
		return 1;
	}
};

bool WiFiController::_createConfigAP		(const char path[]) {
	/*
	{
		"wifi_ap": {
			"name": "ESP_Light",
			"password": ""
		}
	}	
	*/

	File configFile = LittleFS.open(path, "w");
	DynamicJsonDocument doc(1024);
	
	JsonObject root			= doc.to<JsonObject>();
	JsonObject wifi_ap		= root.createNestedObject("wifi_ap");
	wifi_ap["name"]			= "ESP Home";
	wifi_ap["password"]		= "";

	if (serializeJson(doc, configFile) == 0) {
		_logger->logRow("		File wifi_ap: Save error");
		return 0;
	} else {
		_logger->logRow("		File wifi_ap: Created");
		return 1;
	}	
};

bool WiFiController::_readConfigSTA			(const char path[]) {
	
	if (!LittleFS.exists(path)) {
		_logger->logRow("		File wifi_sta: Not Found");
		if (_createConfigSTA(path) == 0) return 0;
	}

	File configFile = LittleFS.open(path, "r");
	DynamicJsonDocument doc(1024);
	deserializeJson(doc, configFile);

	mode 		= WIFI_STA;
	hostname 	= doc["wifi_sta"]["hostname"].as<String>();
	name 		= doc["wifi_sta"]["name"].as<String>();
	_password 	= doc["wifi_sta"]["password"].as<String>();
	_tries 		= doc["wifi_sta"]["tries"].as<uint8_t>();

	return 1;
	
	/*
		Status		status;
		WiFiMode	mode;
		String 		hostname;
		String		name;
		IPAddress	ip;
		int32_t 	rssi;	
	*/

}

bool WiFiController::_readConfigAP			(const char path[]) {
	if (!LittleFS.exists(path)) {
		_logger->logRow("		File wifi_ap: Not Found");
		if (_createConfigAP(path) == 0) return 0;
	}

	File configFile = LittleFS.open(path, "r");
	DynamicJsonDocument doc(1024);
	deserializeJson(doc, configFile);

	mode 		= WIFI_AP;
	name 		= doc["wifi_ap"]["name"].as<String>();
	_password 	= doc["wifi_ap"]["password"].as<String>();
	return 1;	
}

bool WiFiController::_connectRegularMethod 	() {
	/*
	typedef enum {
		WL_NO_SHIELD        = 255,   // for compatibility with WiFi Shield library
		WL_IDLE_STATUS      = 0,
		WL_NO_SSID_AVAIL    = 1,
		WL_SCAN_COMPLETED   = 2,
		WL_CONNECTED        = 3,
		WL_CONNECT_FAILED   = 4,
		WL_CONNECTION_LOST  = 5,
		WL_WRONG_PASSWORD   = 6,
		WL_DISCONNECTED     = 7
	} wl_status_t;
	*/	
	uint8_t i = _tries;

	while (i > 0) {
		i--;

		int8_t wl_status = -1;
		WiFi.begin(name.c_str(), _password.c_str());

		while (wl_status == -1) {
			wl_status = WiFi.waitForConnectResult(1000);
		};

		if (wl_status == WL_NO_SSID_AVAIL) {
			if (i == _tries - 1) {
				_logger->logRow("			WiFi '" + name + "' is out of range or doesn't exist");
			}
			if (i > 1) {
				_logger->logRow("			Will try to connect " + String(i) + " more times");
			} else
			if (i == 1) {
				_logger->logRow("			Will try to connect " + String(i) + " more time");
			} else
			if (i == 0) {
				_logger->logRow("		Regular connect: Error");
				_logger->logRow("			WiFi '" + name + "' is out of range or doesn't exist");				
			}						
		} else {
			switch (wl_status) {
				case WL_CONNECTED:	
					ip = WiFi.localIP();
					rssi = WiFi.RSSI();

					_logger->logRow("		Regular connect: Connected to '" + name + "'");
					_logger->logRow("			IP: " + ip.toString());

					return 1;
					break;
				case WL_WRONG_PASSWORD:
					_logger->logRow("		Regular connect: Error");
					_logger->logRow("			Wrong password");
					break;
				case WL_CONNECT_FAILED:
					_logger->logRow("		Regular connect: Error");
					_logger->logRow("			Failed to connect: SSID or Password is not valid (too long or missing)");			
					break;
				default:
					_logger->logRow("		Regular connect: Error");
					_logger->logRow("			Unusual error: WiFi.status() = " + WiFi.status());					
					break;		
			}
			break;
		}
		delay(10000);
	}
	return 0;	
}

bool WiFiController::beginSTA 				() {
	//Starting from version 3 of this core,
	//persistence is disabled by default and WiFi does not start automatically at boot
	//Legacy behavior can be restored by calling enableWiFiAtBootTime() from anywhere
	#ifdef WIFI_IS_OFF_AT_BOOT
		enableWiFiAtBootTime();
	#endif
	
	_logger->logRow("	WiFi STA:");
	_readConfigSTA(CONFIG_WIFI_STA);

	//Variables check
	if (hostname.length()	== 0) hostname = "AlexESP";
	WiFi.setHostname(hostname.c_str());
	if (name.length() 		== 0) {
		_logger->logRow("		Not valid WiFi Name");
		return 0;
	}
	if (_tries < 1 or _tries > 10) _tries = 5;

	//Fast connect
	delay(2000);
	if (WiFi.status() == WL_CONNECTED and WiFi.SSID() == name.c_str()) {
		ip = WiFi.localIP();
		rssi = WiFi.RSSI();
		_logger->logRow("		Fast connect: Connected to '" + name + "'");
		_logger->logRow("			IP: " + ip.toString());		
		return 1;
	}
	_logger->logRow("		Fast connect: Failed");

	//Regular connect
	_logger->logRow("		Regular connect: Begin");

	WiFi.mode(WIFI_STA);
	WiFi.hostname(hostname.c_str());
	//WiFi.status() doesn't change status when connection lost if WiFi.setAutoReconnect(false)
	WiFi.setAutoReconnect(true); 
	//For future Fast connect
	WiFi.setAutoConnect(true);

	return _connectRegularMethod();
}

bool WiFiController::beginAP				() {
	_logger->logRow("	WiFi AP:");
	_readConfigAP(CONFIG_WIFI_AP);

	if (name.length() 		== 0) {
		_logger->logRow("		Not valid WiFi Name");
		_logger->logRow("		WiFi Name changed to 'ESP Home'");
		name = "ESP Home";		
	}


	_logger->logRow("		Creating WiFi AP '" + name + "' begin");
	WiFi.disconnect();
	WiFi.mode(WIFI_AP);
	WiFi.softAPConfig(IPAddress(192, 168, 1, 1), IPAddress(192, 168, 1, 1), IPAddress(255, 255, 255, 0));
	WiFi.softAP(name.c_str(), _password.c_str());

	delay(2000); //wait for SYSTEM_EVENT_AP_START

	//WiFi.onEvent(_checkApReady, SYSTEM_EVENT_AP_START);

	ip = WiFi.softAPIP();
	rssi = WiFi.RSSI();

	_logger->logRow("		WiFi AP '" + name + "' created");
	_logger->logRow("			IP: " + ip.toString());

	return 1;
}

bool WiFiController::begin					() {
	if (beginSTA() == 0) beginAP();
	return 1;
}