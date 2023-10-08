#include "WebServerController.h"

String WebServerController::getContentType                   (String filename) {
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

String WebServerController::configFileToString               (const char path[]) {
    File configFile = LittleFS.open(path, "r");
	DynamicJsonDocument doc(1024);
    String jsonStr = configFile.readString();

    return jsonStr.substring(jsonStr.indexOf("{")+1, jsonStr.lastIndexOf("}")-jsonStr.indexOf("{"));
}

bool WebServerController::_handleFileRead                     (AsyncWebServerRequest *request) {
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

void WebServerController::_handlerPing                        (AsyncWebServerRequest *request) {
    request->send(200, "text/plain", "Ping successfully");
}

void WebServerController::_handleRestartESP                   (AsyncWebServerRequest *request) {
	request->send(200, "text/plain", "Start rebooting device");
    _rebootTimer.once(1,  ESP.restart);
}

void WebServerController::_handlerFullConfig                  (AsyncWebServerRequest *request) {
    request->send(200, "application/json", "{" 
                                            + configFileToString(CONFIG_WIFI_STA) + ", "
                                            + configFileToString(CONFIG_WIFI_AP) + ", "
                                            + configFileToString(CONFIG_NTP) + "}"
    );
}

void WebServerController::_handlerFirmwareUpdateRequest       (AsyncWebServerRequest *request) {
    request->send(200, "text/html", "<form method='POST' action='/fwupdate' enctype='multipart/form-data'><input type='file' name='update' accept='.bin'><input type='submit' value='Update'></form>");
}

void WebServerController::_handlerFirmwareUpdateResponse      (AsyncWebServerRequest *request) {
    //rebootIsNeeded = !Update.hasError();
    AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", !Update.hasError()?"OK":"FAIL");
    response->addHeader("Connection", "close");
    request->send(response);
}

void WebServerController::_handlerFirmwareUpdateFile          (AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
        uint8_t progress = 0;

        if(index == 0){
            _prev_progress = 0;
            _ContentLength = request->getHeader("Content-Length")->value().toInt();

            Serial.printf("Free space for new firmware: %dB\n", ((ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000));
            Serial.printf("New firmware size:           %dB\n", _ContentLength);
            Serial.printf("New firmware name:           %s\n", filename.c_str());
            Serial.printf("Update Start\n");
            Update.runAsync(true);
            if(!Update.begin((ESP.getFreeSketchSpace() - 0x1000) & 0xFFFFF000)){
                Update.printError(Serial);                
            }
        }
        if(!Update.hasError()){
            progress = (index*100/_ContentLength);
            if (progress != _prev_progress and progress % 5 == 0) {
                _prev_progress = progress;
                Serial.printf("Progress: %dkB/%dkB %d%%\n", index/1024, _ContentLength/1024, progress);
            }                
            if(Update.write(data, len) != len){
                Update.printError(Serial);
            }
        }
        if(final){
            if(Update.end(true)){
                Serial.printf("Update Success:              %dB\n", index+len);
            } else {
                Update.printError(Serial);
            }
        }
}

void WebServerController::_handlerNotFound                    (AsyncWebServerRequest *request) {
    if (!this->_handleFileRead(request))
        request->send(404, "text/plain", "404 Not Found");
}

void WebServerController::begin() {
    /* https://github.com/me-no-dev/ESPAsyncWebServer/issues/1278 */
 
    _webServer->on("/ping",         HTTP_GET,   [&](AsyncWebServerRequest *request) {return _handlerPing(request);                      });
    _webServer->on("/reboot",       HTTP_GET,   [&](AsyncWebServerRequest *request) {return _handleRestartESP(request);                 });
    _webServer->on("/restart",      HTTP_GET,   [&](AsyncWebServerRequest *request) {return _handleRestartESP(request);                 });
    _webServer->on("/fullconfig",   HTTP_GET,   [&](AsyncWebServerRequest *request) {return _handlerFullConfig(request);                });
    _webServer->on("/fwupdate",     HTTP_GET,   [&](AsyncWebServerRequest *request) {return _handlerFirmwareUpdateRequest(request);     });

    //_webServer->on("/fwupdate",       HTTP_POST, _handlerFirmwareUpdateResponse, _handlerFirmwareUpdateFile); 
    _webServer->on("/fwupdate",     HTTP_POST,
            [&](AsyncWebServerRequest *request) {return _handlerFirmwareUpdateResponse(request);     },
            [&](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {return _handlerFirmwareUpdateFile(request, filename, index, data, len, final);     }
    );
    _webServer->onNotFound([&](AsyncWebServerRequest *request){_handlerNotFound(request);});

    _webServer->addHandler(new LittleFsEditor("",""));

    _webServer->begin();
}