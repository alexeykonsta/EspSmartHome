#include "WebServer.h"
extern AsyncWebServer webServer;

Ticker rebootTimer;

String getContentType   (String filename) {
    /*if (HTTP.hasArg("download")) return "application/octet-stream";
    else*/ if (filename.endsWith(".htm")) return "text/html";
    else if (filename.endsWith(".html")) return "text/html";
    else if (filename.endsWith(".json")) return "application/json";
    else if (filename.endsWith(".css")) return "text/css";
    else if (filename.endsWith(".js")) return "application/javascript";
    else if (filename.endsWith(".png")) return "image/png";
    else if (filename.endsWith(".gif")) return "image/gif";
    else if (filename.endsWith(".jpg")) return "image/jpeg";
    else if (filename.endsWith(".ico")) return "image/x-icon";
    else if (filename.endsWith(".xml")) return "text/xml";
    else if (filename.endsWith(".pdf")) return "application/x-pdf";
    else if (filename.endsWith(".zip")) return "application/x-zip";
    else if (filename.endsWith(".gz")) return "application/x-gzip";
    return "text/plain";
}

String configFileToString (const char path[]) {
    File configFile = LittleFS.open(path, "r");
	DynamicJsonDocument doc(1024);
    String jsonStr = configFile.readString();

    return jsonStr.substring(jsonStr.indexOf("{")+1, jsonStr.lastIndexOf("}")-jsonStr.indexOf("{"));
}

bool handleFileRead     (AsyncWebServerRequest *request) {
    String path = request->url();
    if (path.endsWith("/")) path += "index.html";

    if (LittleFS.exists(path)) {
        request->send(LittleFS, path, getContentType(path));
        return 1;
    }
    else if (LittleFS.exists(path+".html")) {
        request->send(LittleFS, path+".html", getContentType(path+".html"));
        return 1;
    }
    else if (LittleFS.exists(path+".htm")) {
        request->send(LittleFS, path+".htm", getContentType(path+".htm"));
        return 1;
    }
    else if (LittleFS.exists(path+".gz")) {
        request->send(LittleFS, path+".gz", getContentType(path));
        return 1;
    }

    Serial.printf("http request 404:\n  path:%s\n  contentType:%s\n\n", path.c_str(), getContentType(path).c_str());
    return 0;   


        /*
        Serial.printf("http request2:\n  path:%s\n  contentType:%s\n\n", path.c_str(), contentType.c_str());
        if (request->hasParam("edit") || request->hasParam("download")) {
            request->_tempFile = LittleFS.open(request->arg("download"), "r");
            request->send(request->_tempFile, request->_tempFile.name(), String(), request->hasParam("download"));
        } else {
            request->send(LittleFS, path, contentType);
        }
        return true;*/

}

void handleRestartESP   (AsyncWebServerRequest *request) {
	request->send(200, "text/plain", "Start rebooting device");
    rebootTimer.once(1,  ESP.restart);
}

void handlerConfig      (AsyncWebServerRequest *request) {
    request->send(200, "application/json", "{" 
                                            + configFileToString(CONFIG_WIFI_STA) + ", "
                                            + configFileToString(CONFIG_WIFI_AP) + ", "
                                            + configFileToString(CONFIG_NTP) + "}"
    );
}

void webServerBegin(/*AsyncWebServer webServer*/) {

    webServer.on("/ping", HTTP_GET, [] (AsyncWebServerRequest *request) {
        request->send(200, "text/plain", "Ping successfully");
    });

    webServer.on("/reboot", HTTP_GET, handleRestartESP);
    webServer.on("/restart", HTTP_GET, handleRestartESP);
    webServer.on("/fullconfig", HTTP_GET, handlerConfig);

    webServer.onNotFound([](AsyncWebServerRequest *request){
        if (!handleFileRead(request))
            request->send(404, "text/plain", "404 Not Found");
    });

    webServer.addHandler(new LittleFsEditor("",""));

    webServer.begin();
}