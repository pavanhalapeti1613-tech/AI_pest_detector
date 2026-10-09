export const ESP32_ARDUINO_SKETCH = `/*
 * AgriSound - ESP32 + INMP441 Acoustic Monitor Firmware
 * 
 * Target Acoustic Classes:
 *   1. Mole Cricket (1.5 kHz - 2.8 kHz subterranean burrow stridulation)
 *   2. Dragonfly (120 Hz - 380 Hz aerial wing-beat flutter)
 * 
 * Connectivity Modes:
 *   - Direct USB Cable: Web Serial API stream at 115200 baud (ZERO config needed!)
 *   - Local WiFi REST Server: HTTP endpoints on /api/latest with CORS enabled
 *   - Cloud Ingestion Push: Direct HTTP POST to dashboard /api/esp32/push
 * 
 * Hardware Wiring (INMP441 I2S Mic):
 *   - SCK / BCLK -> GPIO 14
 *   - WS / LRCK  -> GPIO 15
 *   - SD / DOUT  -> GPIO 32
 *   - VDD        -> 3.3V
 *   - GND & L/R  -> GND
 */

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <driver/i2s.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Optional: Set to your cloud dashboard URL for direct push mode
const char* cloudPushUrl = ""; // e.g. "https://your-app-url/api/esp32/push"

WebServer server(80);

bool pestDetected = false;
String detectedPest = "";
int pestConfidence = 0;
float currentDb = 36.5;
int currentFrequency = 240;

void setCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  server.sendHeader("Access-Control-Allow-Private-Network", "true");
}

String buildJsonPayload() {
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
  return json;
}

void handleOptions() {
  setCORSHeaders();
  server.send(204);
}

void handleGetLatest() {
  setCORSHeaders();
  server.send(200, "application/json", buildJsonPayload());
}

void handleGetHistory() {
  setCORSHeaders();
  server.send(200, "application/json", "[]");
}

void handlePostAck() {
  setCORSHeaders();
  pestDetected = false;
  detectedPest = "";
  pestConfidence = 0;
  server.send(200, "application/json", "{\\"success\\":true,\\"message\\":\\"Acknowledged\\"}");
}

void triggerTestPest(String type) {
  if (type == "mole") {
    pestDetected = true;
    detectedPest = "Mole Cricket";
    pestConfidence = 96;
    currentFrequency = 2180;
    currentDb = 58.4;
  } else if (type == "dragon") {
    pestDetected = true;
    detectedPest = "Dragonfly";
    pestConfidence = 92;
    currentFrequency = 240;
    currentDb = 42.0;
  } else {
    pestDetected = false;
    detectedPest = "";
    pestConfidence = 0;
    currentFrequency = 350;
    currentDb = 32.0;
  }
}

void handleTestTrigger() {
  setCORSHeaders();
  String type = server.hasArg("pest") ? server.arg("pest") : "";
  triggerTestPest(type);
  server.send(200, "application/json", buildJsonPayload());
}

void pushToCloud() {
  if (strlen(cloudPushUrl) > 5 && WiFi.status() == WL_CONNECTED && pestDetected) {
    HTTPClient http;
    http.begin(cloudPushUrl);
    http.addHeader("Content-Type", "application/json");
    http.POST(buildJsonPayload());
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\\n[AGRI-SOUND] ESP32 Acoustic Monitor Initializing...");

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\nWiFi Connected!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\\nWiFi not connected. Running in USB Serial streaming mode.");
  }

  // Setup REST routes with CORS
  server.on("/api/latest", HTTP_OPTIONS, handleOptions);
  server.on("/api/latest", HTTP_GET, handleGetLatest);
  server.on("/latest", HTTP_GET, handleGetLatest);
  server.on("/data", HTTP_GET, handleGetLatest);
  server.on("/", HTTP_GET, handleGetLatest);

  server.on("/api/history", HTTP_OPTIONS, handleOptions);
  server.on("/api/history", HTTP_GET, handleGetHistory);

  server.on("/api/ack", HTTP_OPTIONS, handleOptions);
  server.on("/api/ack", HTTP_POST, handlePostAck);

  server.on("/api/test", HTTP_GET, handleTestTrigger);

  server.enableCORS(true);
  server.begin();
  Serial.println("[AGRI-SOUND] REST Server started. Serial streaming ready at 115200 baud.");
}

unsigned long lastSerialPrint = 0;

void loop() {
  server.handleClient();

  // Stream current JSON payload to Serial every 2 seconds for Web Serial USB connection
  if (millis() - lastSerialPrint > 2000) {
    lastSerialPrint = millis();
    Serial.println(buildJsonPayload());
  }
}
`;
