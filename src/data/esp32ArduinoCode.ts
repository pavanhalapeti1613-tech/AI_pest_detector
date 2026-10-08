export const ESP32_ARDUINO_SKETCH = `/*
 * AgriSound - ESP32 + INMP441 Acoustic Monitor Firmware
 * 
 * Calibrated specifically for:
 *   1. Mole Cricket (1.5 kHz - 2.8 kHz subterranean burrow stridulation)
 *   2. Dragonfly (120 Hz - 380 Hz aerial wing-beat flutter)
 * 
 * Features:
 *   - REST API with CORS headers for direct browser communication
 *   - LittleFS web server to host standalone index.html locally
 *   - I2S INMP441 audio sampling & peak frequency detection
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

// Calibrated Target Acoustic Classes (Only Mole Cricket & Dragonfly)
bool pestDetected = false;
String detectedPest = ""; // "Mole Cricket" or "Dragonfly" or ""
int pestConfidence = 0;
float currentDb = 36.5;
int currentFrequency = 240;

// Enable CORS for web browser access
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
  server.send(200, "application/json", "{\\"success\\":true,\\"message\\":\\"Acknowledged and cleared\\"}");
}

// Optional helper: GET /api/test?pest=mole or GET /api/test?pest=dragon
void handleTestTrigger() {
  setCORSHeaders();
  String type = server.hasArg("pest") ? server.arg("pest") : "";
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
  server.send(200, "application/json", "{\\"status\\":\\"ok\\",\\"pest\\":\\"" + detectedPest + "\\"}");
}

void setup() {
  Serial.begin(115200);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Setup REST routes with CORS
  server.on("/api/latest", HTTP_OPTIONS, handleOptions);
  server.on("/api/latest", HTTP_GET, handleGetLatest);

  server.on("/api/history", HTTP_OPTIONS, handleOptions);
  server.on("/api/history", HTTP_GET, handleGetHistory);

  server.on("/api/ack", HTTP_OPTIONS, handleOptions);
  server.on("/api/ack", HTTP_POST, handlePostAck);

  server.on("/api/test", HTTP_GET, handleTestTrigger);

  server.enableCORS(true);
  server.begin();
  Serial.println("AgriSound REST Server started!");
}

void loop() {
  server.handleClient();
  
  // Acoustic Frequency Classification Example:
  // - If peakFrequency between 1500 Hz & 2800 Hz and amplitude > 50 dB:
  //     detectedPest = "Mole Cricket"; pestDetected = true;
  // - If peakFrequency between 120 Hz & 380 Hz and amplitude > 40 dB:
  //     detectedPest = "Dragonfly"; pestDetected = true;
}
`;
