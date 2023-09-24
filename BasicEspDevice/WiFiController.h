#ifdef ESP32
   	#include <WiFi.h>
#elif defined(ESP8266)
   	#include <ESP8266WiFi.h>
#endif

//#pragma once
	#include <LittleFS.h>
//#pragma once
	#include <ArduinoJson.h>
//#pragma once
	#include "LogBuffer.h"

#define CONFIG_WIFI_STA "/config/wifi_sta.json"
#define CONFIG_WIFI_AP "/config/wifi_ap.json"

class WiFiController {
	public:		
		//Status		status; /*not used*/
		WiFiMode	mode;
		String 		hostname;
		String		name;
		IPAddress	ip;
		int32_t 	rssi;
		//wl_status_t status = WiFi.status();

		WiFiController (LogBuffer &logger) {_logger = &logger;}
		bool begin					();
		bool beginSTA				();
		bool beginAP				();
		
	private:
		String 		_password;
		uint8_t 	_tries;
		LogBuffer* _logger;

		bool _createConfigSTA		(const char path[]);
		bool _createConfigAP		(const char path[]);
		bool _readConfigSTA			(const char path[]);
		bool _readConfigAP			(const char path[]);
		bool _connectRegularMethod 	();		
};