#include "NTPController.h"

bool NTPController::_createConfigNTP                (const char path[]) { 
	/*
	{
		"ntp": {
			"timezonefrom": "web",
			"offset": 0
		}
	}
	*/

	File configFile = LittleFS.open(path, "w");
	DynamicJsonDocument doc(1024);
	
	JsonObject root		= doc.to<JsonObject>();
	JsonObject ntp		= root.createNestedObject("ntp");
	ntp["timezonefrom"]	= "web";
	ntp["offset"]		= 0;
	
	if (serializeJson(doc, configFile) == 0) {
		_logger->logRow("		File ntp: Save error");
		return 0;
	} else {
		_logger->logRow("		File ntp: Created");
		return 1;
	}
}

void NTPController::_initTimeZoneFrom               (const char path[]) {
    if (!LittleFS.exists(path)) {
        NTP_TZF = WEB;
        _createConfigNTP(path);
    } else {
        File configFile = LittleFS.open(path, "r");
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, configFile);
        String timezonefrom = doc["ntp"]["timezonefrom"].as<String>();
        timezonefrom.toUpperCase();

        if (timezonefrom == "web") NTP_TZF = WEB;
        else if (timezonefrom == "config") NTP_TZF = CONFIG;
        else NTP_TZF = NONE;
    }
}

void NTPController::_initTimeZoneFrom               () {
    _initTimeZoneFrom(CONFIG_NTP);
}

int NTPController::_getTimeOffsetFromFile           (const char path[]) {
    if (!LittleFS.exists(path)) {
        _logger->logRow("		File ntp: Not Found");
        _logger->logRow("	NTP : Time zone set to 0");
        return 0;
    } else {
        File configFile = LittleFS.open(path, "r");
        DynamicJsonDocument doc(1024);
        deserializeJson(doc, configFile);
        return doc["ntp"]["offset"].as<int>();
    }
}

bool NTPController::_requestTimeOffsetFromWeb       (WiFiClient &client, HTTPClient &http) {  
    if (http.begin(client, PSTR("http://ip-api.com/json/?fields=status,message,timezone,offset,query")) == 0) {
        _logger->logRow("	NTP: http request return failed");
        return 0;
    }

    int16_t code = http.GET();

    if (code != HTTP_CODE_OK) {
        if (code < 0)
            _logger->logRow("	NTP: http request faild. Return code " + http.errorToString(code));
        else 
            _logger->logRow("	NTP: http request faild. Return code " + String(code));
        
        return 0;
    }

    _logger->logRow("	NTP: http response");
    _logger->logRow("	NTP:    " + http.getString());

    if (http.getString().indexOf("\"status\":\"success\"") == -1) {
        _logger->logRow("	NTP: response hasn't 'status: success' tag" );
        return 0;
    }

    if (http.getString().indexOf("\"offset\"") == -1) {
        _logger->logRow("	NTP: response hasn't 'offset' tag" );
        return 0;
    }

    return 1;
}

int NTPController::_getTimeOffsetFromWeb            (String response) {
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, response);
    return doc["offset"].as<signed int>();
}

String NTPController::_convertOffsetToString        (int offset_min) {
    uint8_t hours = abs(offset_min) / 60;
    uint8_t minutes = abs(offset_min) % 60;

    String offset_str="";
    //PSTR("<+0430>-4:30")
    //PSTR("<+03>-3")

    offset_str += "<";
    offset_str += (offset_min < 0) ? "-" : "+";
    offset_str += (hours < 10) ? "0" : "";
    offset_str += hours;

    if (minutes != 0) {
        offset_str += (minutes < 10) ? "0" : "";
        offset_str += minutes;
    }

    offset_str += ">";
    offset_str += (offset_min < 0) ? "+" : "-";
    offset_str += hours;

    if (minutes != 0) {
        offset_str += ":";
        offset_str += (minutes < 10) ? "0" : "";
        offset_str += minutes;        
    }

    return offset_str;
}

void NTPController::_setTimeOffset                  () {
    WiFiClient client;
    HTTPClient http;
    int offset_min;

    if (NTP_TZF == NONE or NTP_TZF == WEB) {
        if (_requestTimeOffsetFromWeb(client, http) == 1) {
            offset_min = _getTimeOffsetFromWeb(http.getString())/60;
            _logger->logRow("	NTP: get time zone offset from web: " + String(offset_min));          
            NTP_TZF = WEB;            
        }
    }

    if (NTP_TZF == NONE or NTP_TZF == CONFIG) {
        offset_min = _getTimeOffsetFromFile(CONFIG_NTP);
        _logger->logRow("	NTP: timezone offset from config: " + String(offset_min));
    }    

    String offset_str = _convertOffsetToString(offset_min);
    _logger->logRow("	NTP: timezone offset for library: " + offset_str);
    NTP.setTimeZone(offset_str.c_str());
}

void NTPController::_syncTimeZoneFromWeb            () {
    Serial.println("NTP RESYNCK function");
    //_logger->logRow("	LOGGER SYNCK: ");
    /*time_t currentTime = time (NULL);
    struct tm *now = localtime(&currentTime);
    if (now->tm_hour == 22 and now->tm_min == 40) {
        //NTPController::_setTimeOffset();
        Serial.println("NTP RESYNCK");
    }*/
}

void NTPController::begin                           () {    
    _initTimeZoneFrom();
    _setTimeOffset();
    NTP.begin();
    if (NTP_TZF == WEB) {
        //_timeZoneSyncTimer.attach_ms(1000, _syncTimeZoneFromWeb(LogBuffer &logger), logger);
        //_timeZoneSyncTimer.attach_ms(500, std::bind(_syncTimeZoneFromWeb));
        //_timeZoneSyncTimer.attach_ms(500, _syncTimeZoneFromWeb);
    }
}