//Own Libs

#include "WiFiController.h"
#include "NTPController.h"
#include "WebServerController.h"


#include <WiFiClientSecureBearSSL.h>

AsyncWebServer webServer(80);
AsyncWebSocket ws("/");

LogBuffer				logger;
WiFiController			WiFiCtrl		(logger);
NTPController			NTPCtrl			(logger);
WebServerController		WSCtrl		 	(webServer, ws, logger);



uint32_t prev_millis1, prev_millis2;

void setup() {
	delay(2000); //time to arduino monitor ready

	Serial.begin(74880);	
	Serial.println();
	Serial.println();
	Serial.println();
	Serial.println("v13");	
	Serial.printf("			ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());

	webServer.addHandler(&logger.ws);

	LittleFS.begin();
	WiFiCtrl.begin();

	//NTP
	if (WiFiCtrl.mode == WIFI_STA) {
		NTPCtrl.begin();

		//NTP.setTimeZone("Europe/Moscow");
		//PSTR("<+0430>-4:30")
		//NTP.setTimeZone("TZ_Europe_Moscow");		
	}



	
	ws.onEvent(wsOnEvent);
	webServer.addHandler(&ws);
	WSCtrl.begin();


	//logger.test_addSomeRows();
	//Serial.println("----");
	//logger.printLogBufferToSerial();

	prev_millis1 = millis();
	prev_millis2 = millis();
	//test();
	//logger.test_addSomeRows();
	//logger.printLogBufferToSerial();
	//Update.clearError();
}

void loop() { 
	
	if (millis() - prev_millis1 > 1000) {
		//Serial.println(millis()/1000);
		//logger.getTimeStrFromSec (millis()/1000);
		prev_millis1 = millis();
		//logger.logRow(String(millis()));
		wsStatus();
		//Serial.println(logger.getTimeStrFromSec());
	}

	if (millis() - prev_millis2 > 60000) {
		prev_millis2 = millis();
		Serial.println();	
		Serial.println(NTP.getUptimeString());
		Serial.println(NTP.getTimeDateString());
	}		
}

void test () {
	Serial.printf(" test1 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
	std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);
	client->setInsecure();
	Serial.printf(" test2 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
    HTTPClient https;
	Serial.printf(" test3 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
	int tmp = 0;
	tmp = https.begin(*client, PSTR("https://raw.githubusercontent.com/alexeykonsta/ESP-Home-Lamp/master/ESP_main/WiFi.ino"));
	Serial.printf(" test4 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());

	Serial.printf (" http.begin %d\n", tmp);
	tmp = https.GET();
	Serial.printf (" http.GET() %d\n", tmp);
	Serial.printf(" test5 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
	Serial.println(https.getString());
	Serial.printf(" test6 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
	https.end();
	Serial.printf(" test7 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
	client->stop();
	Serial.printf(" test8 ESP.getFreeHeap() = %d\n", ESP.getFreeHeap());
}

void wsStatus() {
    DynamicJsonDocument doc(1024);
    JsonObject root		= doc.to<JsonObject>();    
    root["rssi"]        = WiFiCtrl.rssi;
    root["date"]        = NTP.getDateStr();
    root["time"]        = NTP.getTimeStr();
    //root["ntplastsyncdate"] = NTP.getDateStr(NTP.getLastNTPSync());
	//root["ntplastsynctime"] = NTP.getTimeStr(NTP.getLastNTPSync());
    root["uptime"]      = NTP.getUptimeString();
    root["freeheap"]    = ESP.getFreeHeap();

    String json;
    serializeJson(doc, json);
    ws.textAll(json);
}

void wsOnEvent (AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
		if (type == WS_EVT_CONNECT) {
			ws.text(client->id(),	"{" 
                                    + WSCtrl.configFileToString(CONFIG_WIFI_STA) + ", "
                                    + WSCtrl.configFileToString(CONFIG_WIFI_AP) + ", "
                                    + WSCtrl.configFileToString(CONFIG_NTP) + "}"
    		);
		}
}