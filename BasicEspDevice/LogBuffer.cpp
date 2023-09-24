#include "LogBuffer.h"


/*LogBuffer::LogBuffer() {
	_logRow = 0;
	_maxRowLength = 0;
};*/


uint8_t LogBuffer::getMaxRowLength() {
	return _maxRowLength;
}

void LogBuffer::logRow (String str) {
	String row = NTP.getTimeStr();
	
	row += " " + str;
	if (row.length() > _maxRowLength) _maxRowLength = row.length();
	strncpy(_logBuffer[_logRow], row.c_str(), sizeof(_logBuffer[_logRow]));
	_logBuffer[_logRow][logRowSize - 1] = '\0';

	if (Serial)
		Serial.println(_logBuffer[_logRow]);
	#ifdef webSocket
		DynamicJsonDocument doc(1024);
		JsonObject root			= doc.to<JsonObject>();
		JsonArray json_logger 	= root.createNestedArray("logger");

		String json;
		
		json_logger.add(_logBuffer[_logRow]);
		serializeJson(doc, json);

		ws.textAll(json);
	#endif;

	_logRow++;
	if (_logRow == logBufferSize) _logRow = 0;
}

void LogBuffer::printLogBufferToSerial() {
	uint16_t index;
	
	for (uint8_t i = 0; i < logBufferSize; i++) {
		index = _logRow + i;
		if (index > logBufferSize-1) index = index - logBufferSize;
		//Serial.printf("pts - _logRow: %d, i: %d, index: %d, str: %s\n", _logRow, i, index, _logBuffer[index]);
		if (Serial and strlen(_logBuffer[index])>0)
			Serial.println(_logBuffer[index]);		
	}
}

void LogBuffer::test_addSomeRows () {
	Serial.println("-----------------------------");
	Serial.println();
	logRow("Строка 1");
	logRow("Строка 2");
	logRow("Строка 3");
	logRow("Строка 4");
	logRow("Строка 5");
	logRow("Строка 6");
	logRow("Строка 7");
	logRow("Строка 8");
	logRow("Row    9 abcdefg abcdefg abcdefg abcdefg aabbcc901");
	logRow("Строка 10 11111111111111111111111111111111     901");
	logRow("Строка 11 очень - очень - очень длинная строка 90123456789");
	logRow("Строка 12");
	logRow("Строка 13");
	logRow("Строка 14");
	logRow("Строка 15");
	logRow("Строка 16");
	logRow("Строка 17");
	logRow("Строка 18");
	logRow("Строка 19");
	logRow("Строка 20");
	logRow("Строка 21");
}

#ifdef webSocket
	void LogBuffer::_printLogBufferToWebSocket (uint32_t ws_client_id) {
		uint16_t i, j, index;

		while (i < logBufferSize) {
			DynamicJsonDocument doc(3072);
			JsonObject root			= doc.to<JsonObject>();
			JsonArray json_logger 	= root.createNestedArray("logger");			
			String json;

			while (j < logRowsInOneWSMessage and i < logBufferSize) {

				index = _logRow + i;
				if (index > logBufferSize - 1) index = index - logBufferSize;
				//Serial.printf("ptws j - _logRow: %d, i: %d, j: %d, index: %d, ws_ready: %d,str: %s\n", _logRow, i, j, index, ws.availableForWrite(ws_client_id), _logBuffer[index]);

				if (strlen(_logBuffer[index]) > 0 ) {
					json_logger.add(_logBuffer[index]);
					//Serial.printf("ptws - add, array size:%d\n", json_logger.size());
					j++;
				}
				if (j == logRowsInOneWSMessage or (i == logBufferSize - 1 and j > 0)) {
					serializeJson(doc, json);
					//Serial.printf("ptws - send\n");
					ws.text(ws_client_id, json);								
				}				
				i++;				
			}
			j = 0;
		}
	}
	void LogBuffer::_pingWebSocket () {
		ws.textAll("{\"ping\": 1}");
	}
	void LogBuffer::_wsOnEvent (AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len) {
		if (type == WS_EVT_CONNECT) {
			_printLogBufferToWebSocket(client->id());
		}		
	}
#endif

/*
void LogBuffer::logRow (char str[]) {
	memcpy(
		_logBuffer[_logRow],
		 str,
		 sizeof(_logBuffer[_logRow])
	);
	_logBuffer[_logRow][logRowSize - 1] = '\0';
	
	if (Serial)
		Serial.println(_logBuffer[_logRow]);
	//if websocket existis
	//send to websocket
	
	_logRow++;
	if (_logRow == logBufferSize) _logRow = 0;
};

void LogBuffer::logRow (const char str[]) {
	memcpy( _logBuffer[_logRow], str, sizeof(_logBuffer[_logRow]));
	_logBuffer[_logRow][logRowSize - 1] = '\0';
	
	if (Serial)
		Serial.println(_logBuffer[_logRow]);
	//if websocket existis
	//send to websocket
	
	_logRow++;
	if (_logRow == logBufferSize) _logRow = 0;
};

String LogBuffer::getTimeStrFromSec (uint32_t sec) {

	uint8_t hourAsNum	= (sec / 3600) % 24;
	uint8_t minAsNum	= (sec % 3600) / 60;
	uint8_t secAsNum	= (sec % 3600) % 60;

	String timeStr;

	if (hourAsNum < 10) timeStr += "0";
	timeStr += hourAsNum;
	timeStr += ":";
	if (minAsNum < 10) timeStr += "0";
	timeStr += minAsNum;
	timeStr += ":";
	if (secAsNum < 10) timeStr += "0";
	timeStr += secAsNum;

	return timeStr;
}
*/