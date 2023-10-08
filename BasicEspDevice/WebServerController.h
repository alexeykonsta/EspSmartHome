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

#include "LogBuffer.h"

#define CONFIG_WIFI_STA     "/config/wifi_sta.json"
#define CONFIG_WIFI_AP      "/config/wifi_ap.json"
#define CONFIG_NTP          "/config/ntp.json"

class WebServerController {
    public:
        //AsyncWebServer webServer = AsyncWebServer(80);

        //WebServerController                           (LogBuffer &logger) {_logger = &logger;}
        WebServerController                           (AsyncWebServer &webServer, LogBuffer &logger) {_webServer = &webServer; _logger = &logger; _prev_progress = 0; _ContentLength = 0;}
        void begin                                    ();
        String getContentType                  (String filename);
        String configFileToString              (const char path[]);

    private:
        uint8_t      _prev_progress;
        uint32_t     _ContentLength;

        LogBuffer*          _logger;
        AsyncWebServer*     _webServer;
        Ticker       _rebootTimer;

        bool _handleFileRead                    (AsyncWebServerRequest *request);
        void _handlerPing                       (AsyncWebServerRequest *request);
        void _handleRestartESP                  (AsyncWebServerRequest *request);
        void _handlerFullConfig                 (AsyncWebServerRequest *request);
        void _handlerFirmwareUpdateRequest      (AsyncWebServerRequest *request);
        void _handlerFirmwareUpdateResponse     (AsyncWebServerRequest *request);
        void _handlerFirmwareUpdateFile         (AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final);
        void _handlerNotFound                   (AsyncWebServerRequest *request);
        

};




