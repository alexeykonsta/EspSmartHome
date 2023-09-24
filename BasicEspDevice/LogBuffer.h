#define webSocket;

#include <ArduinoJson.h>
#pragma once
	#include <ESPNtpClient.h>

#ifdef ESP32
    #include <AsyncTCP.h>
#elif defined(ESP8266)
    #include <ESPAsyncTCP.h>
#endif	

#ifdef webSocket
	#ifdef ESP32
		#include <AsyncTCP.h>
	#elif defined(ESP8266)
		#include <ESPAsyncTCP.h>
	#endif

	#include <ESPAsyncWebServer.h>
#endif

#ifndef logBufferSize
#define logBufferSize 100
//#define WS_MAX_QUEUED_MESSAGES 100 chanched in lib //returned back to 8
#endif

#ifndef logRowSize
#define logRowSize 130
#endif

#define logRowsInOneWSMessage 20 // logBufferSize/WS_MAX_QUEUED_MESSAGES(8) < logRowsInOneWSMessage
//JSON buffer size 3072 > logRowsInOneWSMessage*logRowSize


class LogBuffer {
	public:
		#ifdef webSocket
			LogBuffer () {
				_logRow = 0;
				_maxRowLength = 0;

				/*https://github.com/me-no-dev/ESPAsyncWebServer/issues/1278*/
				auto ws_lambda = [&] (AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
							return _wsOnEvent(server, client, type, arg, data, len);
							};
				ws.onEvent(ws_lambda);

				/*https://github.com/me-no-dev/ESPAsyncWebServer/issues/1280*/
				/*_ws.onEvent(
					std::bind(&LogBuffer::_wsOnEvent, this, std::placeholders::_1, 	std::placeholders::_2, std::placeholders::_3, std::placeholders::_4, std::placeholders::_5, std::placeholders::_6)
				);*/
				pingWebSocketTimer.attach_ms(1000, std::bind(&LogBuffer::_pingWebSocket, this));
			}

			AsyncWebSocket ws = AsyncWebSocket("/logger");
			Ticker pingWebSocketTimer;			
		#endif
		#ifndef webSocket
			LogBuffer () {_logRow = 0; _maxRowLength = 0;};
		#endif

		uint8_t getMaxRowLength ();
		void logRow 			(String str);
		void printLogBufferToSerial		();
		

		void test_addSomeRows 	();

		
/*
		void logRow (char str[]);
		void logRow (const char str[]);
		String getTimeStrFromSec (uint32_t secAsNum);
*/				
	private:
		uint8_t		_logRow;
		uint8_t		_maxRowLength;
		char 		_logBuffer[logBufferSize][logRowSize];

		#ifdef webSocket
			void _printLogBufferToWebSocket	(uint32_t ws_client_id);
			void _pingWebSocket ();
			void _wsOnEvent (AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len);
		#endif


};