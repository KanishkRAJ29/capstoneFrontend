/**
 * PayBand Watch Firmware
 * ESP32 firmware for the PayBand digital wallet platform
 * 
 * Features:
 * - Wi-Fi connectivity
 * - QR code scanning via camera module
 * - Fingerprint authentication
 * - Text-to-speech via DFPlayer Mini
 * - Vibration feedback
 * - HTTP and Socket.IO client for real-time updates
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SocketIOclient.h>
#include <Adafruit_Fingerprint.h>
#include <DFRobotDFPlayerMini.h>
#include <SoftwareSerial.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <quirc.h>
#include "esp_camera.h"

// Wi-Fi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API endpoints
const char* serverUrl = "http://your-server-url.com";
const char* socketUrl = "your-server-url.com";
const int socketPort = 5000;
const char* sendPaymentEndpoint = "/api/payments/send";

// Hardware pins
#define VIBRATION_MOTOR_PIN 12
#define DFPLAYER_RX 16
#define DFPLAYER_TX 17
#define FINGERPRINT_RX 18
#define FINGERPRINT_TX 19

// Camera pins
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

// Display settings
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// QR code scanner
struct quirc *qr;
uint8_t *image;
camera_fb_t *fb = NULL;

// Serial connections for DFPlayer and Fingerprint sensor
SoftwareSerial dfPlayerSerial(DFPLAYER_RX, DFPLAYER_TX);
SoftwareSerial fingerprintSerial(FINGERPRINT_RX, FINGERPRINT_TX);

// Initialize components
DFRobotDFPlayerMini dfPlayer;
Adafruit_Fingerprint fingerprint = Adafruit_Fingerprint(&fingerprintSerial);
SocketIOclient socketIO;

// User data
String merchantId = ""; // Your merchant ID

// Payment data
String receiverId = "";
float amount = 0.0;
String requestId = "";
bool paymentInProgress = false;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  dfPlayerSerial.begin(9600);
  fingerprintSerial.begin(57600);
  
  // Initialize display
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("PayBand Watch");
  display.println("Initializing...");
  display.display();
  
  // Initialize vibration motor
  pinMode(VIBRATION_MOTOR_PIN, OUTPUT);
  digitalWrite(VIBRATION_MOTOR_PIN, LOW);
  
  // Initialize DFPlayer Mini
  if (!dfPlayer.begin(dfPlayerSerial)) {
    Serial.println(F("Unable to begin DFPlayer"));
    display.println("DFPlayer error");
    display.display();
  } else {
    Serial.println(F("DFPlayer online"));
    dfPlayer.setTimeOut(500);
    dfPlayer.volume(20);  // Set volume (0-30)
    dfPlayer.EQ(DFPLAYER_EQ_NORMAL);
    dfPlayer.outputDevice(DFPLAYER_DEVICE_SD);
  }
  
  // Initialize fingerprint sensor
  if (fingerprint.verifyPassword()) {
    Serial.println("Fingerprint sensor found");
    display.println("Fingerprint OK");
    display.display();
  } else {
    Serial.println("Fingerprint sensor not found");
    display.println("Fingerprint error");
    display.display();
  }
  
  // Initialize camera
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
  config.pixel_format = PIXFORMAT_GRAYSCALE;
  config.frame_size = FRAMESIZE_VGA;
  config.jpeg_quality = 10;
  config.fb_count = 1;
  
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    display.println("Camera error");
    display.display();
  } else {
    Serial.println("Camera initialized");
    display.println("Camera OK");
    display.display();
  }
  
  // Initialize QR code scanner
  qr = quirc_new();
  if (qr == NULL) {
    Serial.println("Failed to allocate QR scanner");
    display.println("QR scanner error");
    display.display();
  }
  
  // Connect to Wi-Fi
  connectToWiFi();
  
  // Setup Socket.IO client
  socketIO.begin(socketUrl, socketPort, "/socket.io/?EIO=4");
  socketIO.onEvent(socketIOEvent);
  
  // Set merchant ID (should be stored in EEPROM or flash in a real device)
  merchantId = "your-merchant-id"; // Replace with your actual merchant ID
  
  // Ready to use
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("PayBand Watch");
  display.println("Ready to scan");
  display.display();
  
  // Play welcome message
  dfPlayer.play(1); // Assuming 1.mp3 is "PayBand Watch ready"
  vibrate(200); // Short vibration to indicate ready
}

void loop() {
  // Handle Socket.IO events
  socketIO.loop();
  
  // Check if payment is in progress
  if (paymentInProgress) {
    return; // Don't scan QR codes while processing a payment
  }
  
  // Scan for QR codes
  if (scanQRCode()) {
    // Process the payment
    processPayment();
  }
  
  delay(100);
}

void connectToWiFi() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Connecting to WiFi");
  display.display();
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    display.print(".");
    display.display();
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    
    display.println("");
    display.println("WiFi connected");
    display.println(WiFi.localIP().toString());
    display.display();
    delay(1000);
  } else {
    Serial.println("WiFi connection failed");
    display.println("");
    display.println("WiFi failed");
    display.display();
    delay(2000);
    ESP.restart();
  }
}

bool scanQRCode() {
  // Capture a frame from the camera
  fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return false;
  }
  
  // Resize the image to fit the QR scanner
  if (quirc_resize(qr, fb->width, fb->height) < 0) {
    Serial.println("Failed to allocate QR scanner memory");
    esp_camera_fb_return(fb);
    return false;
  }
  
  // Get the image buffer from the QR scanner
  image = quirc_begin(qr, NULL, NULL);
  memcpy(image, fb->buf, fb->width * fb->height);
  
  // Process the image
  quirc_end(qr);
  
  // Count the number of QR codes found
  int count = quirc_count(qr);
  if (count == 0) {
    esp_camera_fb_return(fb);
    return false;
  }
  
  // Extract the QR code data
  struct quirc_code code;
  struct quirc_data data;
  quirc_extract(qr, 0, &code);
  
  if (quirc_decode(&code, &data) != QUIRC_SUCCESS) {
    Serial.println("Failed to decode QR code");
    esp_camera_fb_return(fb);
    return false;
  }
  
  // Convert QR data to string
  String qrData = String((char *)data.payload);
  Serial.println("QR Code found: " + qrData);
  
  // Parse the QR data
  DynamicJsonDocument doc(1024);
  DeserializationError error = deserializeJson(doc, qrData);
  
  if (error) {
    Serial.println("Failed to parse QR data");
    esp_camera_fb_return(fb);
    return false;
  }
  
  // Extract merchant ID
  receiverId = doc["merchantId"].as<String>();
  
  // Check if this is a payment request or just a merchant ID
  if (doc.containsKey("amount")) {
    // This is a payment request
    amount = doc["amount"].as<float>();
    requestId = doc["requestId"].as<String>();
  } else {
    // This is just a merchant ID, prompt for amount
    amount = 0;
    requestId = "";
    
    // Display prompt for amount
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Enter Amount:");
    display.println("Use + and - buttons");
    display.println("to set amount");
    display.display();
    
    // In a real implementation, you would have buttons to set the amount
    // For this demo, we'll just set a default amount
    amount = 100.0; // Default amount
    
    // Display the amount
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Amount set to:");
    display.println("Rs " + String(amount));
    display.println("Press confirm button");
    display.display();
    
    // In a real implementation, you would wait for confirmation
    // For this demo, we'll just proceed after a delay
    delay(2000);
  }
  
  // Release the camera frame buffer
  esp_camera_fb_return(fb);
  
  // Valid QR code with merchant ID found
  return (receiverId != "");
}

void processPayment() {
  paymentInProgress = true;
  
  // Display payment details
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Payment Details:");
  display.print("To: ");
  display.println(receiverId.substring(0, 8) + "...");
  display.print("Amount: Rs ");
  display.println(amount);
  display.println("Authenticate with");
  display.println("fingerprint");
  display.display();
  
  // Announce payment details via TTS
  // Assuming you have pre-recorded audio files for common phrases
  dfPlayer.play(2); // "Pay Rupees"
  delay(1000);
  // You would need to have audio files for numbers or implement a system to play them
  // For simplicity, we'll just use a generic confirmation sound
  dfPlayer.play(3); // "to merchant, authenticate via fingerprint"
  
  // Wait for fingerprint authentication
  bool authenticated = getFingerprintAuthentication();
  
  if (authenticated) {
    // Send payment to server
    sendPayment();
  } else {
    // Payment cancelled
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("Payment cancelled");
    display.println("Authentication failed");
    display.display();
    
    dfPlayer.play(5); // "Payment cancelled"
    vibrate(500); // Long vibration for cancellation
    
    delay(2000);
    paymentInProgress = false;
    
    // Reset display
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("PayBand Watch");
    display.println("Ready to scan");
    display.display();
  }
}

bool getFingerprintAuthentication() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Place finger on");
  display.println("sensor to confirm");
  display.println("payment of Rs " + String(amount));
  display.display();
  
  int attempts = 0;
  while (attempts < 3) {
    uint8_t p = fingerprint.getImage();
    if (p == FINGERPRINT_OK) {
      p = fingerprint.image2Tz();
      if (p == FINGERPRINT_OK) {
        // In a real implementation, you would verify against stored templates
        // For this demo, we'll just accept any fingerprint
        return true;
      }
    }
    delay(100);
    attempts++;
  }
  
  return false;
}

void sendPayment() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Sending payment...");
  display.display();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }
  
  // Prepare JSON payload
  DynamicJsonDocument doc(1024);
  doc["senderId"] = merchantId;
  doc["receiverId"] = receiverId;
  doc["amount"] = amount;
  doc["requestId"] = requestId;
  doc["fingerprintVerified"] = true;
  
  String payload;
  serializeJson(doc, payload);
  
  // Send HTTP request
  HTTPClient http;
  http.begin(String(serverUrl) + String(sendPaymentEndpoint));
  http.addHeader("Content-Type", "application/json");
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("HTTP Response code: " + String(httpResponseCode));
    Serial.println(response);
    
    // Parse response
    DynamicJsonDocument responseDoc(1024);
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      String message = responseDoc["message"].as<String>();
      String transactionId = responseDoc["transactionId"].as<String>();
      
      // Payment successful
      display.clearDisplay();
      display.setCursor(0, 0);
      display.println("Payment Successful!");
      display.print("Rs ");
      display.print(amount);
      display.println(" sent");
      display.println("Transaction ID:");
      display.println(transactionId.substring(0, 16) + "...");
      display.display();
      
      dfPlayer.play(4); // "Payment successful"
      vibrate(200); // Short vibration for success
      
      delay(3000);
    } else {
      // Error parsing response
      paymentFailed("Response error");
    }
  } else {
    // HTTP error
    paymentFailed("HTTP error: " + String(httpResponseCode));
  }
  
  http.end();
  
  // Reset payment state
  paymentInProgress = false;
  receiverId = "";
  amount = 0.0;
  requestId = "";
  
  // Reset display
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("PayBand Watch");
  display.println("Ready to scan");
  display.display();
}

void paymentFailed(String reason) {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Payment Failed");
  display.println(reason);
  display.display();
  
  dfPlayer.play(6); // "Payment failed"
  vibrate(500); // Long vibration for failure
  
  delay(3000);
}

void vibrate(int duration) {
  digitalWrite(VIBRATION_MOTOR_PIN, HIGH);
  delay(duration);
  digitalWrite(VIBRATION_MOTOR_PIN, LOW);
}

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case sIOtype_DISCONNECT:
      Serial.println("Socket.IO Disconnected");
      break;
    case sIOtype_CONNECT:
      Serial.println("Socket.IO Connected");
      // Join room with merchant ID
      socketIO.send(sIOtype_EMIT, "[\"join\", \"" + merchantId + "\"]");
      break;
    case sIOtype_EVENT:
      {
        // Parse event
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, payload, length);
        if (!error) {
          String eventName = doc[0];
          if (eventName == "payment:completed") {
            // Handle payment completed event
            String type = doc[1]["type"];
            float amount = doc[1]["amount"];
            String otherParty = doc[1]["otherParty"];
            
            display.clearDisplay();
            display.setCursor(0, 0);
            display.println("Payment Update");
            display.print(type == "received" ? "Received Rs " : "Sent Rs ");
            display.println(amount);
            display.print("With: ");
            display.println(otherParty);
            display.display();
            
            dfPlayer.play(type == "received" ? 7 : 4); // "Payment received" or "Payment sent"
            vibrate(200); // Short vibration for notification
            
            delay(3000);
            
            // Reset display
            display.clearDisplay();
            display.setCursor(0, 0);
            display.println("PayBand Watch");
            display.println("Ready to scan");
            display.display();
          }
        }
      }
      break;
    case sIOtype_ACK:
      Serial.println("Socket.IO ACK");
      break;
    case sIOtype_ERROR:
      Serial.println("Socket.IO Error");
      break;
    case sIOtype_BINARY_EVENT:
      Serial.println("Socket.IO Binary Event");
      break;
    case sIOtype_BINARY_ACK:
      Serial.println("Socket.IO Binary ACK");
      break;
  }
}
