/*#ifdef ESP32
	#pragma once
    	#include <WiFi.h>
#elif defined(ESP8266)
	#pragma once
    	#include <ESP8266WiFi.h>
    
#endif*/

#include <LittleFS.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
//#include <Ticker.h>

#include "LogBuffer.h"

#define CONFIG_NTP "/config/ntp.json"



class NTPController {
    enum NTPTimeZoneFrom {NONE, WEB, CONFIG};    

    public: 
        NTPController (LogBuffer &logger) {_logger = &logger;}

        NTPTimeZoneFrom NTP_TZF = NONE;
        void    begin                       ();

    private:
        //Ticker _timeZoneSyncTimer;
        LogBuffer* _logger;

        bool    _createConfigNTP		    (const char path[]);
        void    _initTimeZoneFrom           (const char path[]);
        void    _initTimeZoneFrom           ();
        int     _getTimeOffsetFromFile      (const char path[]);
        bool    _requestTimeOffsetFromWeb   (WiFiClient &client, HTTPClient &http);
        int     _getTimeOffsetFromWeb       (String response);
        String  _convertOffsetToString      (int offset_min);
        void    _setTimeOffset              ();
        
        /*static*/ void    _syncTimeZoneFromWeb        ();
        
};











