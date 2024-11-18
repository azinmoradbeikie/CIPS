#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

WiFiClient espClient;
PubSubClient client(espClient);
///////////   POINTS: Change IPAddress, device
// WIFI CONFIGURATION
const char* ssid = "CITIN-CPSLAB";
const char* password = "c1t1nPass";
//// change the IP
IPAddress staticIP(10, 10, 5, 18);
IPAddress gateway(10, 10, 5, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress dns(10, 10, 1, 1);


IPAddress influxDBServer(10, 10, 10, 10);
int influxDBPort = 8086;
const char* influxDBToken = "hBdU3AQ0ixMsdq8R7q9uXPxfYW24CsNeMc3Avj5TvUuIfe_FlKg9IW9crN7fDzcdjk7MnuRPEzWdcpOdAw2x9Q==";
const char* influxDBOrg = "citin";
const char* influxDBBucket = "CIPS";

BLEScan* pBLEScan;
///change the device name
String device = "BLE_Receiver_8";

// device names array
const char* desiredDeviceNames[] = {"50:50:50:aa:00:01", "50:50:50:aa:00:00","50:50:50:aa:00:02", "50:50:50:aa:00:03", "50:50:50:aa:00:04", "50:50:50:aa:00:05",
"50:50:50:aa:00:06","50:50:50:aa:00:07","50:50:50:aa:00:08","50:50:50:aa:00:09","50:50:50:aa:00:10","50:50:50:aa:00:11","50:50:50:aa:00:12","50:50:50:aa:00:13",
"50:50:50:aa:00:14","50:50:50:aa:00:15","50:50:50:aa:00:0a","50:50:50:aa:00:0b","50:50:50:aa:00:0c","50:50:50:aa:00:0d","50:50:50:aa:00:0e","50:50:50:aa:00:0f"};
const int numDesiredDevices = 22;

void setupWiFi();
void sendToInfluxDB(const char* name, float rssi, const char* id);

class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    String deviceName = String(advertisedDevice.getName().c_str());
    String macAddress = advertisedDevice.getAddress().toString().c_str();

    for (int i = 0; i < numDesiredDevices; i++) {
      if (macAddress.equals(desiredDeviceNames[i])) {
        int rssi = advertisedDevice.getRSSI();
        Serial.println(advertisedDevice.getAddress().toString().c_str());
        sendToInfluxDB(macAddress.c_str(), rssi, device.c_str());
        break; 
      }
    }
  }
};

void setup() {
  Serial.begin(115200);
    setupWiFi();
  BLEDevice::init("");
  pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  pBLEScan->setInterval(100);
  pBLEScan->setWindow(99);
}

void loop() {
  client.loop();
  BLEScanResults foundDevices = pBLEScan->start(1, false);
  pBLEScan->clearResults();  
  delay(100); 
}

void setupWiFi() {
  delay(5);
  if (WiFi.config(staticIP, gateway, subnet, dns, dns) == false) {
    //Serial.println(F("Configuration failed."));
  }
  Serial.printf("Connecting to %s", ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("WIFI ON");
    delay(500);
  }
}

void sendToInfluxDB(const char* name, float rssi, const char* id) {
  WiFiClient client;
  HTTPClient http;

  String data = "BLEData,Name=" + String(name) + ",ID=" + String(id) + " RSSI=" + String(rssi);

  String url = "http://" + influxDBServer.toString() + ":" + String(influxDBPort) + "/api/v2/write?org=" + String(influxDBOrg) + "&bucket=" + String(influxDBBucket) + "&precision=s";
  
  http.begin(client, url);
  http.addHeader("Authorization", "Token " + String(influxDBToken));
  http.addHeader("Content-Type", "application/octet-stream");
  int httpResponseCode = http.POST(data);

  if (httpResponseCode > 0) {
    Serial.print("InfluxDB Response Code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("HTTP POST failed, error: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
