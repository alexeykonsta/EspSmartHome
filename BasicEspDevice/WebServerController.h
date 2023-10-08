#ifdef ESP32
    #include <AsyncTCP.h>
#elif defined(ESP8266)
    #include <ESPAsyncTCP.h>
#endif

#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <Ticker.h>                 //Reboot timer (make response before reboot)
#include <ArduinoJson.h>

#include "LittleFsEditor.h"

#define CONFIG_WIFI_STA     "/config/wifi_sta.json"
#define CONFIG_WIFI_AP      "/config/wifi_ap.json"
#define CONFIG_NTP          "/config/ntp.json"



String getContentType       (String filename);
String configFileToString   (const char path[]);
bool handleFileRead         (AsyncWebServerRequest *request);
void handleRestartESP       (AsyncWebServerRequest *request);
void handlerConfig          (AsyncWebServerRequest *request);

void webServerBegin         (/*AsyncWebServer webServer*/);
