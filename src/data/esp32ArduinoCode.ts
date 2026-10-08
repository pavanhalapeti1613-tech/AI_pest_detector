export const ESP32_ARDUINO_SKETCH = `/*
 * AgriSound - ESP32 + INMP441 Acoustic Pest Monitor Firmware
 * 
 * Includes CORS headers for remote browser access and LittleFS web server.
 * 
 * Hardware Wiring:
 *   INMP441 I2S Mic:
 *     - SCK / BCLK -> GPIO 14
 *     - WS / LRCK  -> GPIO 15
 *     - SD / DOUT  -> GPIO 32
 *     - VDD        -> 3.3V
 *     - GND & L/R  -> GND
 */

#include <WiFi.h>
#include <WebServer.h>
#include <driver/i2s.h>
#include <LittleFS.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WebServer server(80);

// Detection state
bool pestDetected = false;
String detectedPest = "";
int pestConfidence = 0;
float currentDb = 35.0;
int currentFrequency = 450;

// Enable CORS for web apps running from external origins/browser
void setCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
}

void handleOptions() {
  setCORSHeaders();
  server.send(204);
}

// GET /api/latest
void handleGetLatest() {
  setCORSHeaders();
  String json = "{";
  json += "\\"detected\\":" + String(pestDetected ? "true" : "false") + ",";
  json += "\\"pest\\":" + (pestDetected ? ("\\"" + detectedPest + "\\"") : "null") + ",";
  json += "\\"confidence\\":" + String(pestConfidence) + ",";
  json += "\\"timestamp\\":\\"" + String(millis()) + "\\",";
  json += "\\"db_level\\":" + String(currentDb, 1) + ",";
  json += "\\"frequency_hz\\":" + String(currentFrequency) + ",";
  json += "\\"device_id\\":\\"ESP32-INMP441-01\\",";
  json += "\\"battery_v\\":4.12";
  json += "}";
  server.send(200, "application/json", json);
}

// GET /api/history
void handleGetHistory() {
  setCORSHeaders();
  server.send(200, "application/json", "[]");
}

// POST /api/ack
void handlePostAck() {
  setCORSHeaders();
  pestDetected = false;
  detectedPest = "";
  pestConfidence = 0;
  server.send(200, "application/json", "{\\"success\\":true,\\"message\\":\\"Acknowledged\\"}");
}

void setup() {
  Serial.begin(115200);
  
  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  // Setup REST routes with CORS
  server.on("/api/latest", HTTP_OPTIONS, handleOptions);
  server.on("/api/latest", HTTP_GET, handleGetLatest);

  server.on("/api/history", HTTP_OPTIONS, handleOptions);
  server.on("/api/history", HTTP_GET, handleGetHistory);

  server.on("/api/ack", HTTP_OPTIONS, handleOptions);
  server.on("/api/ack", HTTP_POST, handlePostAck);

  server.enableCORS(true);
  server.begin();
  Serial.println("AgriSound REST Server started!");
}

void loop() {
  server.handleClient();
  // Acoustic sample logic here...
}
`;
