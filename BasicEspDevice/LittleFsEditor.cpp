#include "LittleFsEditor.h"


static bool matchWild(const char *pattern, const char *testee) {
  const char *nxPat = NULL, *nxTst = NULL;

  while (*testee) {
    if (( *pattern == '?' ) || (*pattern == *testee)){
      pattern++;testee++;
      continue;
    }
    if (*pattern=='*'){
      nxPat=pattern++; nxTst=testee;
      continue;
    }
    if (nxPat){ 
      pattern = nxPat+1; testee=++nxTst;
      continue;
    }
    return false;
  }
  while (*pattern=='*'){pattern++;}  
  return (*pattern == 0);
}

// WEB HANDLER IMPLEMENTATION

#ifdef ESP32
LittleFsEditor::LittleFsEditor(const fs::FS& fs, const String& username, const String& password)
#else
LittleFsEditor::LittleFsEditor(const String& username, const String& password, const fs::FS& fs)
#endif
:_fs(fs)
,_username(username)
,_password(password)
,_authenticated(false)
,_startTime(0)
{}

bool LittleFsEditor::canHandle(AsyncWebServerRequest *request){
  if(request->url().equalsIgnoreCase("/fseditor")){
    if(request->method() == HTTP_GET){
      if(request->hasParam("status"))
        return true;      
      if(request->hasParam("dir"))
        return true;
      if(request->hasParam("edit")){
        request->_tempFile = _fs.open(request->arg("edit"), "r");
        if(!request->_tempFile){
          return false;
        }
#ifdef ESP32
        if(request->_tempFile.isDirectory()){
          request->_tempFile.close();
          return false;
        }
#endif
      }
      if(request->hasParam("download")){
        request->_tempFile = _fs.open(request->arg("download"), "r");
        if(!request->_tempFile){
          return false;
        }
#ifdef ESP32
        if(request->_tempFile.isDirectory()){
          request->_tempFile.close();
          return false;
        }
#endif
      }
      request->addInterestingHeader("If-Modified-Since");
      return true;
    }
    else if(request->method() == HTTP_POST)
      return true;
    else if(request->method() == HTTP_DELETE)
      return true;
    else if(request->method() == HTTP_PUT)
      return true;

  }
  return false;
}

void LittleFsEditor::handleRequest(AsyncWebServerRequest *request){

  /*int params = request->params();
  for(int i=0;i<params;i++){
    AsyncWebParameter* p = request->getParam(i);
    if(p->isFile()){ //p->isPost() is also true
      Serial.printf("FILE[%s]: %s, size: %u\n", p->name().c_str(), p->value().c_str(), p->size());
    } else if(p->isPost()){
      Serial.printf("POST[%s]: %s\n", p->name().c_str(), p->value().c_str());
    } else {
      Serial.printf("GET[%s]: %s\n", p->name().c_str(), p->value().c_str());
    }
  }*/


  if(_username.length() && _password.length() && !request->authenticate(_username.c_str(), _password.c_str()))
    return request->requestAuthentication();
  if(request->method() == HTTP_GET){
    String output;
    if(request->hasParam("status")){
      FSInfo fs_info;

      output = F("{\"type\":\"LittleFS\",\"isOk\":");
      LittleFS.info(fs_info);
      output += F("\"true\", \"totalBytes\":\"");
      output += fs_info.totalBytes;
      output += F("\", \"usedBytes\":\"");
      output += fs_info.usedBytes;
      output += "\"";
      output += F(",\"unsupportedFiles\":\"\"}");

      request->send(200, "application/json", output);
      output = String();
    }
    if(request->hasParam("dir")){
      String path = request->getParam("dir")->value();
#ifdef ESP32
      File dir = _fs.open(path);
#else
      Dir dir = _fs.openDir(path);
#endif
      path = String();
      output = "[";
#ifdef ESP32
      File entry = dir.openNextFile();
      while(entry){
#else
      while(dir.next()){
        fs::File entry = dir.openFile("r");
#endif
        if (output != "[") output += ',';
        output += "{\"type\":\"";
        if (entry.isDirectory()) {
          output += "dir";
        } else {
          output += F("file\",\"size\":\"");
          output += entry.size();
        }
        output += "\",\"name\":\"";
        output += String(entry.name());
        output += "\"}";
#ifdef ESP32
        entry = dir.openNextFile();
#else
        entry.close();
#endif
      }
#ifdef ESP32
      dir.close();
#endif
      output += "]";
      request->send(200, "application/json", output);
      output = String();
    }
    else if(request->hasParam("edit") || request->hasParam("download")){
      request->send(request->_tempFile, request->_tempFile.name(), String(), request->hasParam("download"));
    }
    else {
      const char * buildTime = __DATE__ " " __TIME__ " GMT";
      if (request->header("If-Modified-Since").equals(buildTime)) {
        request->send(304);
      } else {
        AsyncWebServerResponse *response = request->beginResponse(200);
        response->addHeader("Last-Modified", buildTime);
        request->send(LittleFS, F("/fseditor/index.html"));;
      }
    }
  } else if(request->method() == HTTP_DELETE){
    if(request->hasParam("path", true)){
        _fs.remove(request->getParam("path", true)->value());
      request->send(200, "", "DELETE: "+request->getParam("path", true)->value());
    } else
      request->send(404);
  } else if(request->method() == HTTP_POST){
    if(request->hasParam("data", true, true) && _fs.exists(request->getParam("data", true, true)->value()))
      request->send(200, "", "UPLOADED: "+request->getParam("data", true, true)->value());
    else
      request->send(500);
  } else if(request->method() == HTTP_PUT){
    if(request->hasParam("path", true)){
      String filename = request->getParam("path", true)->value();
      if(_fs.exists(filename)){
        request->send(200);
      } else {
        fs::File f = _fs.open(filename, "w");
        if(f){
          f.write((const char *)0);
          f.close();
          request->send(200, "", "CREATE: "+filename);
        } else {
          request->send(500);
        }
      }
    } else
      request->send(400);
  }
}

void LittleFsEditor::handleUpload(AsyncWebServerRequest *request, const String& filename, size_t index, uint8_t *data, size_t len, bool final){
  if(!index){
    if(!_username.length() || request->authenticate(_username.c_str(),_password.c_str())){
      _authenticated = true;
      request->_tempFile = _fs.open(filename, "w");
      _startTime = millis();
    }
  }
  if(_authenticated && request->_tempFile){
    if(len){
      request->_tempFile.write(data,len);
    }
    if(final){
      request->_tempFile.close();
    }
  }
}
