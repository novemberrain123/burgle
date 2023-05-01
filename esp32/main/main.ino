#include "WiFi.h"
#include "esp_camera.h"
#include "Arduino.h"
#include "soc/soc.h"           // Disable brownout problems
#include "soc/rtc_cntl_reg.h"  // Disable brownout problems
#include "driver/rtc_io.h"
#include <SPIFFS.h>
#include <FS.h>
#include <Firebase_ESP_Client.h>
//Provide the token generation process info.
#include <addons/TokenHelper.h>
#include <time.h>
#include "addons/RTDBHelper.h"
#include "freertos/FreeRTOS.h"

//Replace with your network credentials
const char* ssid = "";
const char* password = "";
char FILE_PHOTO[256];
int count = 1;
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 28800; //GMT+8 x 60 x 60
const int   daylightOffset_sec = 0;
#define FILE_DEFAULT "/data/photo.jpg"
// Insert Firebase project API Key
#define API_KEY ""
#define DATABASE_URL "https://burgle-default-rtdb.asia-southeast1.firebasedatabase.app"

// Insert Authorized Email and Corresponding Password
#define USER_EMAIL "pleaseworkusob@gmail.com"
#define USER_PASSWORD ""

// Insert Firebase storage bucket ID e.g bucket-name.appspot.com
#define STORAGE_BUCKET_ID "burgle.appspot.com"

// Photo File Name to save in SPIFFS
//#define FILE_PHOTO "/data/photo.jpg"

// OV2640 camera module pins (CAMERA_MODEL_AI_THINKER)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

boolean takeNewPhoto = true;

//Define Firebase Data objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig configF;

bool taskCompleted = false;

// Check if photo capture was successful
bool checkPhoto( fs::FS &fs ) {
  File f_pic = fs.open( FILE_DEFAULT );
  unsigned int pic_sz = f_pic.size();
  return ( pic_sz > 100 );
}

// Capture Photo and Save it to SPIFFS
void capturePhotoSaveSpiffs( void ) {
  camera_fb_t * fb = NULL; // pointer
  bool ok = 0; // Boolean indicating if the picture has been taken correctly
  do {
    // Take a photo with the camera
    Serial.println("Taking a photo...");

    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      return;
    }
    // Photo file name
    Serial.printf("Picture file name: %s\n", FILE_DEFAULT);
    Serial.println(ESP.getFreeHeap());
    File file = SPIFFS.open(FILE_DEFAULT, FILE_WRITE);
    // Insert the data in the photo file
    if (!file) {
      Serial.println("Failed to open file in writing mode");
    }
    else {
      file.write(fb->buf, fb->len); // payload (image), payload length
      Serial.print("The picture has been saved in ");
      Serial.print(FILE_DEFAULT);
      Serial.print(" - Size: ");
      Serial.print(file.size());
      Serial.println(" bytes");
    }
    // Close the file
    file.close();
    esp_camera_fb_return(fb);

    // check if file has been correctly saved in SPIFFS
    ok = checkPhoto(SPIFFS);
  } while ( !ok );
}

void initWiFi(){
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void initSPIFFS(){
  if (!SPIFFS.begin(true)) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    ESP.restart();
  }
  else {
    delay(500);
    Serial.println("SPIFFS mounted successfully");
  }
}

void initCamera(){
 // OV2640 camera module
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    ESP.restart();
  } 
  sensor_t *s = esp_camera_sensor_get();
  s->set_contrast(s, 2);
  s->set_saturation(s, -2);
  s->set_reg(s,0xff,0xff,0x01);//banksel
  s->set_reg(s,0x11,0xff,01);//frame rate
  s->set_awb_gain(s, 1);
  s->set_brightness(s,1);
}

void setup() {
  // Serial port for debugging purposes
  Serial.begin(115200);
  initWiFi();
  initSPIFFS();
  // Turn-off the 'brownout detector'
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  initCamera();

  //Firebase
  // Assign the api key
  configF.api_key = API_KEY;
  configF.database_url = DATABASE_URL;
  //Assign the user sign in credentials
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  //Assign the callback function for the long running token generation task
  configF.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h

  Firebase.begin(&configF, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  if (takeNewPhoto) {
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
    struct tm timeinfo;
    if(!getLocalTime(&timeinfo)){
      Serial.println("Failed to obtain time");
    }
    char timeString[20];
    strftime(timeString, 20, "%Y%m%dT%H%M%S", &timeinfo);
    snprintf(FILE_PHOTO, sizeof(FILE_PHOTO), "%s%s%d%s", "/data/photo", timeString, count, ".jpg");
    capturePhotoSaveSpiffs();
    takeNewPhoto = false;
  }
  delay(1);
  if (Firebase.ready() && !taskCompleted){
    taskCompleted = true;
    Serial.print("Uploading picture... ");
    Serial.println(xPortGetFreeHeapSize());
    //MIME type should be valid to avoid the download problem.
    //The file systems for flash and SD/SDMMC can be changed in FirebaseFS.h.
    if (Firebase.Storage.upload(&fbdo, STORAGE_BUCKET_ID /* Firebase Storage bucket id */, FILE_DEFAULT /* path to local file */, mem_storage_type_flash /* memory storage type, mem_storage_type_flash and mem_storage_type_sd */, FILE_PHOTO /* path of remote file stored in the bucket */, "image/jpeg" /* mime type */)){
      Serial.printf("Picture saved in %s\n", FILE_PHOTO);
      auto photoURL = fbdo.downloadURL();
      Serial.printf("\nDownload URL: %s\n", photoURL);
      takeNewPhoto = true;
      taskCompleted = false;
      count++;
      Firebase.RTDB.setString(&fbdo, "latestJPG", photoURL);
      //if intrusion occurred, store current photoname for analysis
      int intrusion=0;
      if(Firebase.RTDB.getInt(&fbdo, "intrusion2")){
        intrusion = fbdo.intData();
        Serial.println("System intrusion value is " + intrusion);
        Firebase.RTDB.setInt(&fbdo, "intrusion2", 0); //want initial image before intrusion
      }
      else{
        Serial.println("Failed to get turnOn value");
        Serial.println(fbdo.errorReason());
      }

      if(intrusion == 1){
        if(Firebase.RTDB.setString(&fbdo, "intrusionJPG", photoURL)){
          Serial.println("Set intrusionJPG value.");
        }
        else{
          Serial.println("Failed to set intrusionJPG value");
          Serial.println(fbdo.errorReason());
        }
      }
      delay(10000);

    }
    else{
      Serial.println(fbdo.errorReason());
    }
  }
}