#define TRIG_PIN 23 // ESP32 pin GIOP23 connected to Ultrasonic Sensor's TRIG pin
#define ECHO_PIN 22 // ESP32 pin GIOP22 connected to Ultrasonic Sensor's ECHO pin
#define LED_PIN 5

float duration_us, distance_cm;

#if defined(ESP32)
#include <WiFiMulti.h>
WiFiMulti wifiMulti;
#define DEVICE "ESP32"
#elif defined(ESP8266)
#include <ESP8266WiFiMulti.h>
ESP8266WiFiMulti wifiMulti;
#define DEVICE "ESP8266"
#endif

#include <InfluxDbClient.h>
#include <InfluxDbCloud.h>
#include <Firebase_ESP_Client.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// WiFi AP SSID
#define WIFI_SSID "TP-Link_4A9C"
// WiFi password
#define WIFI_PASSWORD "20077792"
// InfluxDB v2 server url, e.g. https://eu-central-1-1.aws.cloud2.influxdata.com (Use: InfluxDB UI -> Load Data -> Client Libraries)
#define INFLUXDB_URL "http://192.168.1.2:8086"
// InfluxDB v2 server or cloud API token (Use: InfluxDB UI -> Data -> API Tokens -> Generate API Token)
//#define INFLUXDB_TOKEN "X8aduxyvI1kQ4W3Fu8png6VUpe-1RdQl5QvURsjjAa-HunMjKT7jZwKiET_9MCKkBSm7WryKOPQ2Cd_ec0hnbw=="
#define INFLUXDB_TOKEN "6WvhUf1Hh_mh2dCUERLhhyPOwV1eMGlp0XEFfy1pd90nA8Lnoc1Fqo4QljWdDjnWiqKs2RDb1vz6TMgJJmv9mw=="
// InfluxDB v2 organization id (Use: InfluxDB UI -> User -> About -> Common Ids )
#define INFLUXDB_ORG "johnorg"
// InfluxDB v2 bucket name (Use: InfluxDB UI ->  Data -> Buckets)
#define INFLUXDB_BUCKET "bucket1"
#define API_KEY "AIzaSyDMA8WmbQ18Y-0ta7HEw8gRJgSGuiwtm5I"
#define USER_EMAIL "pleaseworkusob@gmail.com"
#define USER_PASSWORD "2000qwe5M:::"
#define STORAGE_BUCKET_ID "burgle.appspot.com"
#define DATABASE_URL "https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app"
// Set timezone string according to https://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html
// Examples:
//  Pacific Time: "PST8PDT"
//  Eastern: "EST5EDT"
//  Japanesse: "JST-9"
//  Central Europe: "CET-1CEST,M3.5.0,M10.5.0/3"
#define TZ_INFO "CET-1CEST,M3.5.0,M10.5.0/3"

// InfluxDB client instance with preconfigured InfluxCloud certificate
InfluxDBClient client(INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN, InfluxDbCloud2CACert);
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;
unsigned long sendDataPrevMillis = 0;
int count = 0;
// Data point
Point sensor("sensors");

void setup() {
  Serial.begin(115200);
  // configure the trigger pin to output mode
  pinMode(TRIG_PIN, OUTPUT);
  // configure the echo pin to input mode
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  // Setup wifi
  WiFi.mode(WIFI_STA);
  wifiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to wifi");
  while (wifiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    delay(100);
  }
  Serial.println();
  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;
    /* Sign up */
  
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  // if (Firebase.signUp(&config, &auth, "", "")){
  //   Serial.println("ok");
  //   signupOK = true;
  // }
  // else{
  //   Serial.printf("%s\n", config.signer.signupError.message.c_str());
  // }
  
  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  // Add tags
  sensor.addTag("device", DEVICE);
  sensor.addTag("SSID", WiFi.SSID());

  // Accurate time is necessary for certificate validation and writing in batches
  // For the fastest time sync find NTP servers in your area: https://www.pool.ntp.org/zone/
  // Syncing progress and the time will be printed to Serial.
  timeSync(TZ_INFO, "pool.ntp.org", "time.nis.gov");

  // Check server connection
  if (client.validateConnection()) {
    Serial.print("Connected to InfluxDB: ");
    Serial.println(client.getServerUrl());
  } else {
    Serial.print("InfluxDB connection failed: ");
    Serial.println(client.getLastErrorMessage());
  }
}

double getUltraSonic() {
  // generate 10-microsecond pulse to TRIG pin
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  // measure duration of pulse from ECHO pin
  duration_us = pulseIn(ECHO_PIN, HIGH);

  // calculate the distance
  distance_cm = 0.017 * duration_us;

  // print the value to Serial Monitor
  Serial.print("distance: ");
  Serial.print(distance_cm);
  Serial.println(" cm");
  
  return distance_cm;
}

double getThreshold() {
  char query[] = "from(bucket: \"bucket1\") |> range(start: -24h) |> filter(fn: (r) => r._measurement == \"sensor_threshold1\" and r._field == \"ultrasonic1\") |> last()";
  FluxQueryResult result = client.query(query);
  double value;
  while(result.next()){
    value = result.getValueByName("_value").getDouble();
    Serial.print("threshold value: ");
    Serial.print(value);
    Serial.println(" cm");

  }
  return value;

}

void loop() {
  // Clear fields for reusing the point. Tags will remain untouched
  sensor.clearFields();

  // Store measured value into point
  double value = getUltraSonic();

  sensor.addField("ultrasonic1", value);

  // Print what are we exactly writing
  Serial.print("Writing: ");
  Serial.println(sensor.toLineProtocol());

  // Check WiFi connection and reconnect if needed
  if (wifiMulti.run() != WL_CONNECTED) {
    Serial.println("Wifi connection lost");
  }

  // Write point
  if(client.validateConnection()) {
    Serial.println("Connected");
  }
  else{
    Serial.println(client.getLastStatusCode());
  }
  if (!client.writePoint(sensor)) {
    Serial.print("InfluxDB write failed: ");
    Serial.println(client.getLastErrorMessage());
  }
  double threshold = getThreshold();
  int turnOn=0;
  if(Firebase.RTDB.getInt(&fbdo, "turnOn")){
    turnOn = fbdo.intData();
    Serial.println("System turnOn value is " + turnOn);
  }
  else{
    Serial.println("Failed to get turnOn value");
    Serial.println(fbdo.errorReason());
  }
  if(value < threshold && turnOn){
    digitalWrite(LED_PIN, HIGH);
    if (Firebase.ready())
    {
      if (Firebase.RTDB.setInt(&fbdo, "test/int", 1)){
        Serial.println("PASSED");
        Serial.println("PATH: " + fbdo.dataPath());
        Serial.println("TYPE: " + fbdo.dataType());
      }
      else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
      }

      //allows intrusion analysis ui to show and analysis to occur
      if (Firebase.RTDB.setInt(&fbdo, "intrusion", 1)){
        Serial.println("PASSED");
        Serial.println("PATH: " + fbdo.dataPath());
        Serial.println("TYPE: " + fbdo.dataType());
      }
      else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
      }
            //allows intrusion analysis ui to show and analysis to occur
      if (Firebase.RTDB.setInt(&fbdo, "intrusion2", 1)){
        Serial.println("PASSED");
        Serial.println("PATH: " + fbdo.dataPath());
        Serial.println("TYPE: " + fbdo.dataType());
      }
      else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
      }
    }
  }
  else{
    digitalWrite(LED_PIN, LOW);
    if (Firebase.ready())
    {
      if (Firebase.RTDB.setInt(&fbdo, "test/int", 0)){
        Serial.println("PASSED");
        Serial.println("PATH: " + fbdo.dataPath());
        Serial.println("TYPE: " + fbdo.dataType());
      }
      else {
        Serial.println("FAILED");
        Serial.println("REASON: " + fbdo.errorReason());
      }
    }
  }
  Serial.println("Wait 1s");
  delay(1000);
}


