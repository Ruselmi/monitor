/*
 * IMPORTANT: If you see "fatal error: opening output file ... Invalid argument",
 * it is because your project path contains special characters (?? in OneDrive).
 * Please move the project folder to a simple path like C:\SmartClass
 */
#include "smart_class_config.h"
#include "web_page.h"
#include <ArduinoJson.h>
#include <ArduinoOTA.h>
#include <DHT.h>
#include <DNSServer.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <Update.h>
#include <WebServer.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <esp_task_wdt.h>
#include <time.h>

// Safety check for Sound Pin
#ifndef PIN_SOUND_AO
#define PIN_SOUND_AO 32
#endif

// ================= VARIABEL GLOBAL =================
DHT dht(PIN_DHT, DHTTYPE);
WebServer server(STA_WEB_PORT);
DNSServer dnsServer;
Preferences preferences;

float t = 0, h = 0, dist = 0;
int val_ldr = 0, val_mq2 = 0, val_flame = 1;
int val_sound_ao = 0; // Sound analog (primary)
int mq2_baseline = 0, ldr_baseline = 0;
int mq2_threshold = MQ2_THRESHOLD_DEFAULT;

// DO Polarity: auto-detected saat kalibrasi
int pol_mq2 = POLARITY_UNKNOWN;   // polarity MQ2 DO
int pol_flame = POLARITY_UNKNOWN; // polarity Flame DO
// int pol_sound = POLARITY_UNKNOWN; // polarity Sound DO
int pol_ldr = POLARITY_UNKNOWN; // polarity LDR DO

// Timing
unsigned long lastDataSend = 0, lastCmdCheck = 0, lastCalibration = 0;
bool isConfigMode = false, wifiConnected = false, otaEnabled = true;
bool buzzerContinuous = false;
bool buzzerPlaying = false;
unsigned long bootTime = 0;

// Non-blocking Music
int musicNoteIndex = 0;
int currentMusicId = -1;
unsigned long noteStartTime = 0;
const int* currentMelody = nullptr;
int melodyLength = 0;
bool musicPlaying = false;
// const long AUTO_CALIB_INTERVAL = 300000;  // 5 menit (Use config.h value)
unsigned long data_interval_ms = 60000;   // Default 1 menit

// PIR People Counter
int peopleCount = 0;
bool lastPirState = false;
unsigned long lastPirTrigger = 0;

// Bell Schedule
bool bellEnabled = true;
int lastBellMinute = -1;
unsigned long lastBellCheck = 0;
bool ntpSynced = false;

// Mode & Debug
String currentMode = "normal";
bool debugMode = false;

// ================= COMMAND REGISTRY SYSTEM =================
struct Command {
  const char* name;
  void (*handler)(String arg);
};

// Forward declarations
void cmdStatus(String arg);
void cmdSensors(String arg);
void cmdAlarm(String arg);
void cmdStop(String arg);
void cmdBuzzer(String arg);
void cmdWifi(String arg);
void cmdThreshold(String arg);
void cmdCalibrate(String arg);
void cmdRestart(String arg);
void cmdHelp(String arg);
void cmdUptime(String arg);
void cmdHealth(String arg);
void cmdScanWifi(String arg);
void cmdNetstat(String arg);
void cmdDebug(String arg);
void cmdExport(String arg);
void cmdMode(String arg);

// Command Registry - Efficient lookup table
Command commandRegistry[] = {
  {"status", cmdStatus},
  {"sensors", cmdSensors},
  {"health", cmdHealth},
  {"uptime", cmdUptime},
  {"alarm", cmdAlarm},
  {"stop", cmdStop},
  {"buzzer", cmdBuzzer},
  {"play", cmdBuzzer},
  {"threshold", cmdThreshold},
  {"calibrate", cmdCalibrate},
  {"cal", cmdCalibrate},
  {"mode", cmdMode},
  {"wifi", cmdWifi},
  {"scanwifi", cmdScanWifi},
  {"netstat", cmdNetstat},
  {"debug", cmdDebug},
  {"restart", cmdRestart},
  {"reboot", cmdRestart},
  {"export", cmdExport},
  {"help", cmdHelp},
  {"?", cmdHelp},
};

const int COMMAND_COUNT = sizeof(commandRegistry) / sizeof(commandRegistry[0]);

// Process command from string
void processCommand(String cmdStr) {
  cmdStr.trim();
  if (cmdStr.length() == 0) return;
  
  int spaceIdx = cmdStr.indexOf(' ');
  String cmd = cmdStr;
  String arg = "";
  
  if (spaceIdx > 0) {
    cmd = cmdStr.substring(0, spaceIdx);
    arg = cmdStr.substring(spaceIdx + 1);
    arg.trim();
  }
  
  cmd.toLowerCase();
  
  for (int i = 0; i < COMMAND_COUNT; i++) {
    if (cmd == commandRegistry[i].name) {
      Serial.printf("[CMD] Executing: %s with arg: %s\n", cmd.c_str(), arg.c_str());
      commandRegistry[i].handler(arg);
      return;
    }
  }
  
  Serial.printf("[CMD] Unknown command: %s\n", cmd.c_str());
  Serial.println("[CMD] Type /help for available commands");
}

// ========== COMMAND HANDLERS ==========

void cmdStatus(String arg) {
  Serial.println("\n========== STATUS PERANGKAT ==========");
  Serial.printf("Device: %s\n", DEVICE_NAME);
  Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
  Serial.printf("Uptime: %lu detik\n", (millis() - bootTime) / 1000);
  Serial.printf("Free Heap: %d bytes\n", ESP.getFreeHeap());
  Serial.printf("Mode: %s\n", currentMode.c_str());
  Serial.printf("MQ2 Threshold: %d\n", mq2_threshold);
  Serial.printf("Data Interval: %d ms\n", data_interval_ms);
  Serial.printf("Bell Enabled: %s\n", bellEnabled ? "Yes" : "No");
  Serial.printf("WiFi Connected: %s\n", wifiConnected ? "Yes" : "No");
  Serial.println("======================================\n");
}

void cmdSensors(String arg) {
  readSensors();
  Serial.println("\n========== SENSOR READING ==========");
  Serial.printf("Suhu: %.1f°C\n", t);
  Serial.printf("Kelembaban: %.1f%%\n", h);
  Serial.printf("Jarak: %.1f cm\n", dist);
  Serial.printf("LDR: %d\n", val_ldr);
  Serial.printf("MQ2: %d\n", val_mq2);
  Serial.printf("Flame: %d\n", val_flame);
  Serial.printf("Sound AO: %d\n", val_sound_ao);
  Serial.printf("People Count: %d\n", peopleCount);
  Serial.println("====================================\n");
}

void cmdHealth(String arg) {
  Serial.println("\n========== HEALTH CHECK ==========");
  Serial.printf("Free Heap: %d bytes (Min: %d)\n", ESP.getFreeHeap(), ESP.getMinFreeHeap());
  Serial.printf("CPU Frequency: %d MHz\n", getCpuFrequencyMhz());
  Serial.printf("Flash Size: %d bytes\n", ESP.getFlashChipSize());
  Serial.printf("WiFi Status: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.printf("Uptime: %lu detik\n", (millis() - bootTime) / 1000);
  Serial.println("===================================\n");
}

void cmdUptime(String arg) {
  unsigned long secs = (millis() - bootTime) / 1000;
  int days = secs / 86400;
  int hours = (secs % 86400) / 3600;
  int mins = (secs % 3600) / 60;
  Serial.printf("\n>>> Uptime: %d hari, %d jam, %d menit (%lu detik)\n\n", days, hours, mins, secs);
}

void cmdAlarm(String arg) {
  Serial.println("\n>>> Testing Alarm System...");
  playMusic(2);
  Serial.println(">>> Alarm played!\n");
}

void cmdStop(String arg) {
  buzzerContinuous = false;
  ledcWrite(PWM_CHANNEL, 0);
  Serial.println("\n>>> Alarm dimatikan!\n");
}

void cmdBuzzer(String arg) {
  if (arg.length() == 0) {
    Serial.println("\n>>> Usage: /buzzer [0-24] atau /buzzer NOTE:frekensi:duration");
    Serial.println(">>> Contoh: /buzzer 6 (Mario), /buzzer NOTE:440:200 (A4 200ms)");
    return;
  }
  
  if (arg.startsWith("NOTE:")) {
    int sep1 = arg.indexOf(':', 5);
    int sep2 = arg.indexOf(':', sep1 + 1);
    if (sep1 > 0) {
      int freq = arg.substring(5, sep2 > 0 ? sep2 : arg.length()).toInt();
      int dur = 200;
      if (sep2 > 0) dur = arg.substring(sep2 + 1).toInt();
      if (freq > 0) {
        Serial.printf("\n>>> Playing note: %d Hz for %d ms\n", freq, dur);
        playTone(freq, dur);
      }
    }
  } else {
    int musicId = arg.toInt();
    if (musicId >= 0 && musicId <= 24) {
      Serial.printf("\n>>> Playing music ID: %d\n", musicId);
      playMusic(musicId);
    } else {
      Serial.println("\n>>> Invalid music ID! Use 0-24");
    }
  }
}

void cmdWifi(String arg) {
  Serial.println("\n========== WIFI STATUS ==========");
  Serial.printf("SSID: %s\n", WiFi.SSID().c_str());
  Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("RSSI: %d dBm\n", WiFi.RSSI());
  Serial.printf("Channel: %d\n", WiFi.channel());
  Serial.println("======================================");
}

void cmdScanWifi(String arg) {
  Serial.println("\n>>> Scanning WiFi networks...");
  int n = WiFi.scanNetworks();
  Serial.printf("Found %d networks:\n\n", n);
  for (int i = 0; i < n; i++) {
    Serial.printf("%d. %s (RSSI: %d dBm)\n", i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i));
  }
  Serial.println("");
}

void cmdNetstat(String arg) {
  Serial.println("\n========== NETWORK STATS ==========");
  Serial.printf("WiFi Status: %s\n", WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  Serial.printf("Local IP: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("Last Data Send: %lu ms ago\n", millis() - lastDataSend);
  Serial.println("======================================");
}

void cmdDebug(String arg) {
  debugMode = !debugMode;
  Serial.printf("\n>>> Debug mode: %s\n\n", debugMode ? "ON" : "OFF");
}

void cmdThreshold(String arg) {
  if (arg.length() == 0) {
    Serial.printf("\n>>> Current MQ2 Threshold: %d\n\n", mq2_threshold);
    return;
  }
  
  int newThreshold = arg.toInt();
  if (newThreshold > 0) {
    mq2_threshold = newThreshold;
    preferences.begin(PREFS_NAMESPACE, false);
    preferences.putInt("mq2_th", mq2_threshold);
    preferences.end();
    Serial.printf("\n>>> MQ2 Threshold updated to: %d\n\n", mq2_threshold);
  } else {
    Serial.println("\n>>> Invalid threshold value!\n");
  }
}

void cmdCalibrate(String arg) {
  Serial.println("\n>>> Starting calibration...");
  autoCalibrate();
  Serial.println(">>> Calibration complete!\n");
}

void cmdMode(String arg) {
  arg.toLowerCase();
  if (arg == "normal") {
    currentMode = "normal";
    data_interval_ms = 60000;
    bellEnabled = true;
    Serial.println("\n>>> Mode: NORMAL (60s interval)\n");
  } else if (arg == "hemat" || arg == "eco") {
    currentMode = "hemat";
    data_interval_ms = 300000;
    bellEnabled = false;
    Serial.println("\n>>> Mode: HEMAT (5 min interval, bell disabled)\n");
  } else if (arg == "siaga" || arg == "alert") {
    currentMode = "siaga";
    data_interval_ms = 30000;
    bellEnabled = true;
    Serial.println("\n>>> Mode: SIAGA (30s interval)\n");
  } else {
    Serial.printf("\n>>> Current mode: %s\n", currentMode.c_str());
    Serial.println(">>> Usage: /mode [normal|hemat|siaga]\n");
  }
}

void cmdRestart(String arg) {
  Serial.println("\n>>> Restarting ESP32...\n");
  delay(500);
  ESP.restart();
}

void cmdExport(String arg) {
  Serial.println("\n>>> Force exporting data to spreadsheet...");
  readSensors();
  sendDataToGAS();
  Serial.println(">>> Export complete!\n");
}

void cmdHelp(String arg) {
  Serial.println("========== DAFTAR COMMAND ==========\n"
"PERINTAH UTAMA:\n"
"  /status     - Status lengkap perangkat\n"
"  /sensors    - Baca semua sensor\n"
"  /health     - Info RAM, suhu chip\n"
"  /uptime     - Lama perangkat aktif\n\n"
"KONTROL:\n"
"  /alarm      - Test alarm\n"
"  /stop       - Matikan alarm\n"
"  /buzzer X   - Mainkan musik (0-24)\n"
"  /buzzer NOTE:freq:dur - Piano\n\n"
"SENSOR:\n"
"  /threshold X - Set MQ2 threshold\n"
"  /calibrate  - Kalibrasi sensor\n"
"  /mode X     - Mode [normal|hemat|siaga]\n\n"
"JARINGAN:\n"
"  /wifi       - Info WiFi\n"
"  /scanwifi   - Scan jaringan\n"
"  /netstat    - Status koneksi\n"
"  /debug      - Toggle debug mode\n"
"  /restart    - Reboot ESP32\n\n"
"DATA:\n"
"  /export     - Ekspor data ke Sheet\n"
"  /help       - Tampilkan pesan ini\n"
"====================================");
}

// ================= VALIDASI SENSOR =================
bool isValidTemp(float v) {
  return !isnan(v) && v >= TEMP_MIN && v <= TEMP_MAX;
}
bool isValidHumid(float v) {
  return !isnan(v) && v >= HUMID_MIN && v <= HUMID_MAX;
}
bool isValidDist(float v) {
  return !isnan(v) && v >= DIST_MIN && v <= DIST_MAX;
}
int clampSensor(int v, int lo, int hi) {
  return (v < lo) ? lo : (v > hi) ? hi : v;
}

// ================= BUZZER & MUSIK =================
void setupBuzzer() {
  // Setup LEDC for buzzer on ESP32
  ledcSetup(PWM_CHANNEL, PWM_FREQ, PWM_RES);
  ledcAttachPin(PIN_BUZZER, PWM_CHANNEL);
  ledcWrite(PWM_CHANNEL, 0);  // Start with no sound
}

// Immediate tone for piano - plays note directly without blocking (using LEDC)
void playToneImmediate(int freq, int dur) {
  // Stop any previous tone first
  ledcWrite(PWM_CHANNEL, 0);
  
  if (freq > 0) {
    ledcWriteTone(PWM_CHANNEL, freq);
    buzzerPlaying = true;
    
    // Small delay for note duration
    delay(dur);
    
    // Stop tone
    ledcWrite(PWM_CHANNEL, 0);
    buzzerPlaying = false;
  }
}

// Blocking tone for music sequences (original behavior)
void playTone(int freq, int dur) {
  if (freq > 0) {
    ledcWriteTone(PWM_CHANNEL, freq);
  } else {
    ledcWrite(PWM_CHANNEL, 0);
  }

  unsigned long start = millis();
  while (millis() - start < dur) {
    esp_task_wdt_reset();
    delay(10);
  }
  ledcWrite(PWM_CHANNEL, 0);
}

void playMusic(int id) {
  buzzerContinuous = false;
  switch (id) {
  case 0: // Stop
    ledcWrite(PWM_CHANNEL, 0);
    break;

  case 1: // Startup Melody
    playTone(NOTE_E5, 150);
    delay(50);
    playTone(NOTE_G5, 150);
    delay(50);
    playTone(NOTE_C6, 300);
    break;
  case 2: // Emergency Alarm
    for (int i = 0; i < 3; i++) {
      playTone(800, 200);
      delay(50);
      playTone(1200, 200);
      delay(50);
    }
    break;
  case 3: // School Bell
    for (int i = 0; i < 4; i++) {
      playTone(NOTE_E6, 300);
      delay(100);
      playTone(NOTE_C6, 300);
      delay(100);
    }
    break;
  case 4: // Nokia Ringtone
    playTone(NOTE_E5, 150);
    playTone(NOTE_D5, 150);
    playTone(NOTE_FS4, 300);
    playTone(NOTE_GS4, 300);
    playTone(NOTE_CS5, 150);
    playTone(NOTE_B4, 150);
    playTone(NOTE_D4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_B4, 150);
    playTone(NOTE_A4, 150);
    playTone(NOTE_CS4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_A4, 600);
    break;
  case 5: // Happy Birthday
    playTone(NOTE_C4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_D4, 400);
    playTone(NOTE_C4, 400);
    playTone(NOTE_F4, 400);
    playTone(NOTE_E4, 600);
    delay(200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_D4, 400);
    playTone(NOTE_C4, 400);
    playTone(NOTE_G4, 400);
    playTone(NOTE_F4, 600);
    break;
  case 6: // Mario Theme
    // Intro
    playTone(NOTE_E5, 150);
    playTone(NOTE_E5, 150);
    delay(150);
    playTone(NOTE_E5, 150);
    delay(150);
    playTone(NOTE_C5, 150);
    playTone(NOTE_E5, 300);
    playTone(NOTE_G5, 300);
    delay(300);
    playTone(NOTE_G4, 300);
    delay(300);
    // Main Theme
    playTone(NOTE_C5, 300); playTone(NOTE_G4, 200); delay(100); playTone(NOTE_E4, 300);
    playTone(NOTE_A4, 200); playTone(NOTE_B4, 200); playTone(NOTE_AS4, 100); playTone(NOTE_A4, 200);
    playTone(NOTE_G4, 200); playTone(NOTE_E5, 200); playTone(NOTE_G5, 200);
    playTone(NOTE_A5, 300); playTone(NOTE_F5, 150); playTone(NOTE_G5, 150);
    delay(150); playTone(NOTE_E5, 300); playTone(NOTE_C5, 150); playTone(NOTE_D5, 150); playTone(NOTE_B4, 300);
    break;
  case 7: // Twinkle Star
    playTone(NOTE_C4, 300);
    playTone(NOTE_C4, 300);
    playTone(NOTE_G4, 300);
    playTone(NOTE_G4, 300);
    playTone(NOTE_A4, 300);
    playTone(NOTE_A4, 300);
    playTone(NOTE_G4, 600);
    delay(200);
    playTone(NOTE_F4, 300);
    playTone(NOTE_F4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_C4, 600);
    break;
  case 8: // Buzzer ON (continuous 1kHz)
    buzzerContinuous = true;
    ledcWriteTone(PWM_CHANNEL, 1000);
    break;
  case 9: // Buzzer OFF
    buzzerContinuous = false;
    ledcWrite(PWM_CHANNEL, 0);
    break;

  case 10: // Für Elise
    playTone(NOTE_E5, 200);
    playTone(NOTE_DS5, 200);
    playTone(NOTE_E5, 200);
    playTone(NOTE_DS5, 200);
    playTone(NOTE_E5, 200);
    playTone(NOTE_B4, 200);
    playTone(NOTE_D5, 200);
    playTone(NOTE_C5, 200);
    playTone(NOTE_A4, 400);
    delay(100);
    playTone(NOTE_C4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_A4, 200);
    playTone(NOTE_B4, 400);
    break;
  case 11: // Ode to Joy
    playTone(NOTE_E4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_F4, 300);
    playTone(NOTE_G4, 300);
    playTone(NOTE_G4, 300);
    playTone(NOTE_F4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_C4, 300);
    playTone(NOTE_C4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_E4, 450);
    playTone(NOTE_D4, 150);
    playTone(NOTE_D4, 600);
    break;
  case 12: // Jingle Bells
    playTone(NOTE_E4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_E4, 400);
    playTone(NOTE_E4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_E4, 400);
    playTone(NOTE_E4, 200);
    playTone(NOTE_G4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_E4, 600);
    delay(200);
    playTone(NOTE_F4, 200);
    playTone(NOTE_F4, 200);
    playTone(NOTE_F4, 200);
    playTone(NOTE_F4, 200);
    playTone(NOTE_F4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_E4, 100);
    playTone(NOTE_E4, 100);
    playTone(NOTE_E4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_D4, 400);
    playTone(NOTE_G4, 400);
    break;
  case 13: // We Wish You Merry Christmas
    playTone(NOTE_C4, 200);
    playTone(NOTE_F4, 200);
    playTone(NOTE_F4, 150);
    playTone(NOTE_G4, 150);
    playTone(NOTE_F4, 150);
    playTone(NOTE_E4, 150);
    playTone(NOTE_D4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_G4, 200);
    playTone(NOTE_G4, 150);
    playTone(NOTE_A4, 150);
    playTone(NOTE_G4, 150);
    playTone(NOTE_F4, 150);
    playTone(NOTE_E4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_A4, 200);
    playTone(NOTE_A4, 150);
    playTone(NOTE_AS4, 150);
    playTone(NOTE_A4, 150);
    playTone(NOTE_G4, 150);
    playTone(NOTE_F4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_C4, 200);
    playTone(NOTE_D4, 200);
    playTone(NOTE_G4, 200);
    playTone(NOTE_E4, 200);
    playTone(NOTE_F4, 400);
    break;
  case 14: // Star Wars Theme
    playTone(NOTE_G4, 400); playTone(NOTE_G4, 400); playTone(NOTE_G4, 400);
    playTone(NOTE_DS4, 300); playTone(NOTE_AS4, 100);
    playTone(NOTE_G4, 400); playTone(NOTE_DS4, 300); playTone(NOTE_AS4, 100);
    playTone(NOTE_G4, 800);
    delay(200);
    playTone(NOTE_D5, 400); playTone(NOTE_D5, 400); playTone(NOTE_D5, 400);
    playTone(NOTE_DS5, 300); playTone(NOTE_AS4, 100);
    playTone(NOTE_FS4, 400); playTone(NOTE_DS4, 300); playTone(NOTE_AS4, 100);
    playTone(NOTE_G4, 800);
    delay(200);
    // Part 2
    playTone(NOTE_G5, 400); playTone(NOTE_G4, 200); playTone(NOTE_G4, 200);
    playTone(NOTE_G5, 400); playTone(NOTE_FS5, 300); playTone(NOTE_F5, 100);
    playTone(NOTE_E5, 100); playTone(NOTE_DS5, 100); playTone(NOTE_E5, 200);
    delay(200); playTone(NOTE_GS4, 200); playTone(NOTE_CS5, 400);
    playTone(NOTE_C5, 300); playTone(NOTE_B4, 100); playTone(NOTE_AS4, 100); playTone(NOTE_A4, 100);
    playTone(NOTE_AS4, 200); delay(200);
    break;
  case 15: // Tetris Theme (Korobeiniki)
    playTone(NOTE_E5, 300);
    playTone(NOTE_B4, 150);
    playTone(NOTE_C5, 150);
    playTone(NOTE_D5, 300);
    playTone(NOTE_C5, 150);
    playTone(NOTE_B4, 150);
    playTone(NOTE_A4, 300);
    playTone(NOTE_A4, 150);
    playTone(NOTE_C5, 150);
    playTone(NOTE_E5, 300);
    playTone(NOTE_D5, 150);
    playTone(NOTE_C5, 150);
    playTone(NOTE_B4, 450);
    playTone(NOTE_C5, 150);
    playTone(NOTE_D5, 300);
    playTone(NOTE_E5, 300);
    playTone(NOTE_C5, 300);
    playTone(NOTE_A4, 300);
    playTone(NOTE_A4, 600);
    // Part B
    delay(200);
    playTone(NOTE_D5, 300); playTone(NOTE_F5, 150); playTone(NOTE_A5, 300);
    playTone(NOTE_G5, 150); playTone(NOTE_F5, 150); playTone(NOTE_E5, 450);
    playTone(NOTE_C5, 150); playTone(NOTE_E5, 300); playTone(NOTE_D5, 150);
    playTone(NOTE_C5, 150); playTone(NOTE_B4, 300); playTone(NOTE_B4, 150);
    playTone(NOTE_C5, 150); playTone(NOTE_D5, 300); playTone(NOTE_E5, 300);
    playTone(NOTE_C5, 300); playTone(NOTE_A4, 300); playTone(NOTE_A4, 600);
    break;
  case 16: // Pacman
    playTone(NOTE_B4, 100);
    playTone(NOTE_B5, 100);
    playTone(NOTE_FS5, 100);
    playTone(NOTE_DS5, 100);
    playTone(NOTE_B5, 75);
    playTone(NOTE_FS5, 200);
    playTone(NOTE_DS5, 300);
    playTone(NOTE_C5, 100);
    playTone(NOTE_C6, 100);
    playTone(NOTE_G5, 100);
    playTone(NOTE_E5, 100);
    playTone(NOTE_C6, 75);
    playTone(NOTE_G5, 200);
    playTone(NOTE_E5, 300);
    break;
  case 17: // Do Re Mi
    playTone(NOTE_C4, 400);
    playTone(NOTE_D4, 400);
    playTone(NOTE_E4, 400);
    playTone(NOTE_F4, 400);
    playTone(NOTE_G4, 400);
    playTone(NOTE_A4, 400);
    playTone(NOTE_B4, 400);
    playTone(NOTE_C5, 600);
    delay(200);
    playTone(NOTE_C5, 400);
    playTone(NOTE_B4, 400);
    playTone(NOTE_A4, 400);
    playTone(NOTE_G4, 400);
    playTone(NOTE_F4, 400);
    playTone(NOTE_E4, 400);
    playTone(NOTE_D4, 400);
    playTone(NOTE_C4, 600);
    break;
  case 18: // London Bridge
    playTone(NOTE_G4, 300);
    playTone(NOTE_A4, 150);
    playTone(NOTE_G4, 150);
    playTone(NOTE_F4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_F4, 300);
    playTone(NOTE_G4, 600);
    delay(100);
    playTone(NOTE_D4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_F4, 600);
    playTone(NOTE_E4, 300);
    playTone(NOTE_F4, 300);
    playTone(NOTE_G4, 600);
    break;
  case 19: // Mary Had a Little Lamb
    playTone(NOTE_E4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_C4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_E4, 300);
    playTone(NOTE_E4, 600);
    playTone(NOTE_D4, 300);
    playTone(NOTE_D4, 300);
    playTone(NOTE_D4, 600);
    playTone(NOTE_E4, 300);
    playTone(NOTE_G4, 300);
    playTone(NOTE_G4, 600);
    break;
  case 20:                        // Bel Masuk (Ding Dong)
    for (int i = 0; i < 6; i++) { // Repeated 6 times (Longer)
      playTone(NOTE_E5, 400);
      playTone(NOTE_C5, 400);
      delay(100);
    }
    playTone(NOTE_E5, 200);
    playTone(NOTE_G5, 200);
    playTone(NOTE_E5, 200);
    playTone(NOTE_C5, 600);
    break;
  case 21: // Bel Istirahat
    playTone(NOTE_G5, 300);
    playTone(NOTE_E5, 300);
    playTone(NOTE_G5, 300);
    playTone(NOTE_E5, 300);
    delay(200);
    // Repeat melody
    for (int k = 0; k < 2; k++) {
      playTone(NOTE_G5, 150);
      playTone(NOTE_A5, 150);
      playTone(NOTE_G5, 150);
      playTone(NOTE_E5, 150);
      playTone(NOTE_C5, 600);
      delay(300);
      playTone(NOTE_E5, 200);
      playTone(NOTE_G5, 200);
      playTone(NOTE_C6, 600);
      delay(300);
    } // End repeat
    break;
  case 22: // Bel Pulang
    playTone(NOTE_C5, 200);
    playTone(NOTE_E5, 200);
    playTone(NOTE_G5, 200);
    playTone(NOTE_C6, 400);
    delay(200);
    for (int k = 0; k < 2; k++) { // Repeat 2x
      playTone(NOTE_C6, 200);
      playTone(NOTE_G5, 200);
      playTone(NOTE_E5, 200);
      playTone(NOTE_C5, 400);
      delay(200);
      playTone(NOTE_G5, 300);
      playTone(NOTE_E5, 300);
      playTone(NOTE_C5, 300);
      playTone(NOTE_G4, 600);
    }
    break;

    case 23: // Warning Siren
      for (int i = 0; i < 4; i++) {
        for (int f = 500; f < 1500; f += 50) {
          playTone(f, 15);
        }
        for (int f = 1500; f > 500; f -= 50) {
          playTone(f, 15);
        }
      }
      break;
    case 24: // Indonesia Raya (Full Stanza 1)
      // Intro
      playTone(NOTE_G4, 300); playTone(NOTE_E4, 150); playTone(NOTE_G4, 150);
      playTone(NOTE_A4, 300); playTone(NOTE_A4, 300); playTone(NOTE_G4, 150); playTone(NOTE_A4, 150);
      playTone(NOTE_B4, 300); playTone(NOTE_B4, 300); delay(100);
      playTone(NOTE_A4, 150); playTone(NOTE_B4, 150); playTone(NOTE_C5, 300); playTone(NOTE_C5, 300);
      // Intro
      int irMelody[] = {
        NOTE_G4,300, NOTE_E4,150, NOTE_G4,150, NOTE_A4,300, NOTE_A4,300, NOTE_G4,150, NOTE_A4,150,
        NOTE_B4,300, NOTE_B4,300, 0,100, NOTE_A4,150, NOTE_B4,150, NOTE_C5,300, NOTE_C5,300,
        NOTE_B4,150, NOTE_A4,150, NOTE_G4,600, 0,300,
        // Stanza 1
        NOTE_F4,400, NOTE_F4,200, NOTE_F4,200, NOTE_F4,400, NOTE_E4,200, NOTE_F4,200,
        NOTE_G4,300, NOTE_C4,300, 0,100, NOTE_C4,200, NOTE_D4,200, NOTE_E4,400, NOTE_E4,400,
        NOTE_D4,200, NOTE_C4,200, NOTE_B3,600, 0,300,
        // Stanza 2
        NOTE_G4,400, NOTE_G4,200, NOTE_G4,200, NOTE_G4,400, NOTE_F4,200, NOTE_E4,200,
        NOTE_A4,600, 0,100, NOTE_A4,200, NOTE_A4,200, NOTE_C5,400, NOTE_A4,200,
        NOTE_G4,400, NOTE_F4,200, NOTE_E4,600, 0,300,
        // Stanza 3
        NOTE_F4,400, NOTE_F4,200, NOTE_F4,200, NOTE_F4,400, NOTE_E4,200, NOTE_F4,200,
        NOTE_G4,300, NOTE_C5,300, 0,100, NOTE_C5,200, NOTE_B4,200, NOTE_A4,400, NOTE_G4,400,
        NOTE_F4,200, NOTE_E4,200, NOTE_D4,600, 0,300,
        // Stanza 4
        NOTE_G4,400, NOTE_G4,200, NOTE_G4,200, NOTE_G4,400, NOTE_F4,200, NOTE_E4,200,
        NOTE_A4,600, 0,100, NOTE_A4,200, NOTE_G4,200, NOTE_F4,400, NOTE_E4,400,
        NOTE_D4,200, NOTE_G4,200, NOTE_C4,600, 0,400,
        // Refrain
        NOTE_D4,300, NOTE_D4,150, NOTE_E4,400, NOTE_D4,200, NOTE_G4,400, NOTE_E4,200, NOTE_D4,600, 0,100,
        NOTE_D4,300, NOTE_D4,150, NOTE_E4,400, NOTE_D4,200, NOTE_G4,400, NOTE_E4,200, NOTE_D4,600, 0,100,
        // Bangunlah jiwanya
        NOTE_D4,300, NOTE_D4,150, NOTE_E4,400, NOTE_D4,200, NOTE_G4,400, NOTE_A4,200, NOTE_B4,600, 0,100,
        NOTE_B4,300, NOTE_B4,150, NOTE_C5,400, NOTE_B4,200, NOTE_A4,400, NOTE_G4,200, NOTE_A4,600, 0,400,
        // Indonesia Raya
        NOTE_C5,400, NOTE_C5,200, NOTE_A4,400, NOTE_F4,200, NOTE_G4,400, NOTE_G4,200, NOTE_E4,600, 0,100,
        NOTE_C4,200, NOTE_C4,200, NOTE_G4,400, NOTE_F4,200, NOTE_E4,400, NOTE_D4,200, NOTE_C4,800
      };
      for (int i = 0; i < sizeof(irMelody)/sizeof(irMelody[0]); i += 2) {
        playTone(irMelody[i], irMelody[i+1]);
      }
      break;
  }
}

  // ================= ANTI-NOISE AVERAGING =================
  int getStableAnalog(int pin) {
    long sum = 0;
    for (int i = 0; i < SAMPLES_COUNT; i++) {
      sum += analogRead(pin);
      delay(SENSOR_READ_DELAY);
    }
    return (int)(sum / SAMPLES_COUNT);
  }

  // ================= AUTO KALIBRASI + DO POLARITY =================
  void autoCalibrate() {
    Serial.println("\n[CAL] Memulai Auto-Kalibrasi (10 detik)...");
    long mqSum = 0, ldrSum = 0;

    for (int i = 0; i < CALIBRATION_SAMPLES; i++) {
      mqSum += getStableAnalog(PIN_MQ2);
      ldrSum += getStableAnalog(PIN_LDR);
      digitalWrite(PIN_LED, !digitalRead(PIN_LED));
      delay(CALIBRATION_DURATION);
      esp_task_wdt_reset(); // Prevent WDT trigger during long calibration
    }

    mq2_baseline = mqSum / CALIBRATION_SAMPLES;
    ldr_baseline = ldrSum / CALIBRATION_SAMPLES;

    // === AUTO-DETECT DO POLARITY ===
    // Asumsi: saat kalibrasi, lingkungan AMAN
    // Baca DO pin → nilai saat aman
    int mq2_do_safe = digitalRead(PIN_MQ2_DO);
    int flame_do_safe = digitalRead(PIN_FLAME);
    // int sound_do_safe = digitalRead(PIN_SOUND);
    int ldr_do_safe = digitalRead(PIN_LDR_DO);

    // Jika DO=LOW saat aman → 0=aman, 1=bahaya → ACTIVE_HIGH
    // Jika DO=HIGH saat aman → 1=aman, 0=bahaya → ACTIVE_LOW
    pol_mq2 = (mq2_do_safe == LOW) ? POLARITY_ACTIVE_HIGH : POLARITY_ACTIVE_LOW;
    pol_flame =
        (flame_do_safe == LOW) ? POLARITY_ACTIVE_HIGH : POLARITY_ACTIVE_LOW;
    // pol_sound =
    //    (sound_do_safe == LOW) ? POLARITY_ACTIVE_HIGH : POLARITY_ACTIVE_LOW;
    pol_ldr = (ldr_do_safe == LOW) ? POLARITY_ACTIVE_HIGH : POLARITY_ACTIVE_LOW;

    // Simpan ke Preferences
    preferences.begin(PREFS_NAMESPACE, false);
    preferences.putInt(PREFS_KEY_MQ2_POL, pol_mq2);
    preferences.putInt(PREFS_KEY_FLAME_POL, pol_flame);
    // preferences.putInt(PREFS_KEY_SOUND_POL, pol_sound);
    preferences.putInt(PREFS_KEY_LDR_POL, pol_ldr);
    preferences.end();

    Serial.printf("[CAL] MQ2 Base:%d | LDR Base:%d\n", mq2_baseline,
                  ldr_baseline);
    Serial.printf("[CAL] Polarity - MQ2:%s Flame:%s LDR:%s\n",
                  pol_mq2 == POLARITY_ACTIVE_LOW ? "AL" : "AH",
                  pol_flame == POLARITY_ACTIVE_LOW ? "AL" : "AH",
                  // pol_sound == POLARITY_ACTIVE_LOW ? "AL" : "AH",
                  pol_ldr == POLARITY_ACTIVE_LOW ? "AL" : "AH");

    if (mq2_do_safe == LOW && pol_mq2 == POLARITY_ACTIVE_HIGH) {
      mq2_threshold = MQ2_THRESHOLD_HIGH;
      Serial.println(
          "[CAL] Warning: Lingkungan awal bergas, Threshold ditingkatkan.");
    }

    digitalWrite(PIN_LED, LOW);
    playMusic(1);
    lastCalibration = millis();
    Serial.println("[CAL] Selesai!");
  }

  // Cek apakah sensor DO mendeteksi bahaya berdasarkan polarity
  bool isDODanger(int doValue, int polarity) {
    if (polarity == POLARITY_ACTIVE_LOW)
      return (doValue == LOW);
    if (polarity == POLARITY_ACTIVE_HIGH)
      return (doValue == HIGH);
    return (doValue == LOW); // default fallback: active low
  }

  // ================= PEMBACAAN SENSOR =================
  void readSensors() {
    float rawT = dht.readTemperature();
    float rawH = dht.readHumidity();
    t = isValidTemp(rawT) ? rawT : 0.0f;
    h = isValidHumid(rawH) ? rawH : 0.0f;

    digitalWrite(PIN_TRIG, LOW);
    delayMicroseconds(2);
    digitalWrite(PIN_TRIG, HIGH);
    delayMicroseconds(10);
    digitalWrite(PIN_TRIG, LOW);
    long dur = pulseIn(PIN_ECHO, HIGH, 30000);
    float rawDist = (dur > 0) ? (dur * 0.034 / 2) : 0;
    dist = isValidDist(rawDist) ? rawDist : 0.0f;

    val_ldr = clampSensor(getStableAnalog(PIN_LDR), LDR_MIN, LDR_MAX);
    val_mq2 = clampSensor(getStableAnalog(PIN_MQ2), MQ2_MIN, MQ2_MAX);
    val_flame = digitalRead(PIN_FLAME);
    // val_sound = digitalRead(PIN_SOUND); // Disabled
    val_sound_ao = analogRead(PIN_SOUND_AO); // Analog sound (primary)

    // Deteksi bahaya menggunakan polarity yang sudah dideteksi
    bool gasAlert = isDODanger(digitalRead(PIN_MQ2_DO), pol_mq2) ||
                    (val_mq2 > (mq2_baseline + mq2_threshold));
    bool flameAlert = isDODanger(val_flame, pol_flame);

    if (flameAlert || gasAlert) {
      Serial.println("!!! DETEKSI BAHAYA !!!");
      Serial.printf("  Flame:%d(%s) Gas:%d MQ2:%d>%d+%d\n", val_flame,
                    flameAlert ? "BAHAYA" : "AMAN", gasAlert, val_mq2,
                    mq2_baseline, mq2_threshold);
      if (!buzzerContinuous)
        playMusic(2);
    }

    Serial.printf("T:%.1f H:%.1f LDR:%d MQ2:%d Dist:%.1f\n", t, h, val_ldr,
                  val_mq2, dist);
  }

  // ================= WIFI =================
  void checkWiFiConnection() {
    if (WiFi.status() == WL_CONNECTED) {
      if (!wifiConnected) {
        Serial.println("[WIFI] Reconnected!");
        wifiConnected = true;
      }
      return;
    }
    wifiConnected = false;
    Serial.println("[WIFI] Reconnecting...");
    preferences.begin(PREFS_NAMESPACE, false);
    String ssid = preferences.getString(PREFS_KEY_SSID, DEFAULT_SSID);
    String pass = preferences.getString(PREFS_KEY_PASS, DEFAULT_PASS);
    preferences.end();
    WiFi.disconnect();
    delay(100);
    WiFi.begin(ssid.c_str(), pass.c_str());
    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < WIFI_MAX_RETRY) {
      delay(WIFI_RECONNECT_DELAY);
      retry++;
    }
    wifiConnected = (WiFi.status() == WL_CONNECTED);
    Serial.println(wifiConnected ? "[WIFI] OK: " + WiFi.localIP().toString()
                                 : "[WIFI] FAIL");
  }

  // ================= GOOGLE APPS SCRIPT =================
  bool sendDataToGAS() {
    if (WiFi.status() != WL_CONNECTED)
      return false;
    digitalWrite(PIN_LED, HIGH);
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient https;
    String url =
        "https://script.google.com/macros/s/" + String(GAS_ID) + "/exec";
    https.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    https.begin(client, url);
    https.addHeader("Content-Type", "application/json");
    https.setTimeout(15000);

    String json = "{\"key\":\"" + String(GAS_API_KEY) + "\",\"device\":\"" +
                  String(DEVICE_NAME) +
                  "\","
                  "\"t\":" +
                  String(t, 1) + ",\"h\":" + String(h, 1) +
                  ","
                  "\"d\":" +
                  String(dist, 1) + ",\"l\":" + String(val_ldr) +
                  ","
                  "\"g\":" +
                  String(val_mq2) + ",\"f\":" + String(val_flame) +
                  ","
                  "\"sa\":" + String(val_sound_ao) +
                  ","
                  "\"mq2do\":" +
                  String(digitalRead(PIN_MQ2_DO)) +
                  ","
                  "\"ldrdo\":" +
                  String(digitalRead(PIN_LDR_DO)) +
                  ","
                  "\"pol_mq2\":" +
                  String(pol_mq2) +
                  ","
                  "\"pol_flame\":" +
                  String(pol_flame) +
                  ","
                  "\"rssi\":" +
                  String(WiFi.RSSI()) +
                  ","
                  "\"uptime\":" +
                  String((millis() - bootTime) / 1000) +
                  ",\"p\":" + String(peopleCount) + "}";

    int code = https.POST(json);
    if (code > 0)
      Serial.printf("[CLOUD] %d: %s\n", code, https.getString().c_str());
    else
      Serial.printf("[CLOUD] ERR: %s\n", https.errorToString(code).c_str());
    https.end();
    digitalWrite(PIN_LED, LOW);
    return (code >= 200 && code <= 303) || code == 307;
  }

// ================= CHECK COMMAND DARI GAS =================
  bool checkCommand() {
    if (WiFi.status() != WL_CONNECTED)
      return false;
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient https;
    String url = "https://script.google.com/macros/s/" + String(GAS_ID) +
                 "/exec?action=getCommand&device=" + String(DEVICE_NAME);
    https.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
    https.begin(client, url);
    https.setTimeout(10000);
    int code = https.GET();
    bool ok = false;
    if (code == 200) {
      String payload = https.getString();
      Serial.printf("[CMD] %s\n", payload.c_str());
      JsonDocument doc;
      if (!deserializeJson(doc, payload)) {
        String cmd = doc["command"].as<String>();
        
        // Music playback
        if (cmd.startsWith("PLAY:")) {
          playMusic(cmd.substring(5).toInt());
          ok = true;
        }
        // Piano NOTE:frequency:duration
        else if (cmd.startsWith("NOTE:")) {
          int sep = cmd.indexOf(':', 5);
          if (sep > 0) {
            int freq = cmd.substring(5, sep).toInt();
            int dur = cmd.substring(sep + 1).toInt();
            if (freq > 0 && dur > 0 && dur <= 2000) {
              playToneImmediate(freq, dur);
            }
          } else {
            int freq = cmd.substring(5).toInt();
            if (freq > 0) playToneImmediate(freq, 200);
          }
          ok = true;
        }
        // Calibration
        else if (cmd == "CALIBRATE") {
          autoCalibrate();
          ok = true;
        }
        // Threshold setting
        else if (cmd.startsWith("THRESHOLD:")) {
          mq2_threshold = cmd.substring(10).toInt();
          preferences.begin(PREFS_NAMESPACE, false);
          preferences.putInt("mq2_th", mq2_threshold);
          preferences.end();
          ok = true;
        }
        // Mode: normal, hemat, siaga
        else if (cmd.startsWith("MODE:")) {
          String mode = cmd.substring(5);
          mode.toLowerCase();
          if (mode == "normal") {
            currentMode = "normal";
            data_interval_ms = 60000;
            bellEnabled = true;
          } else if (mode == "hemat" || mode == "eco") {
            currentMode = "hemat";
            data_interval_ms = 300000;
            bellEnabled = false;
          } else if (mode == "siaga" || mode == "alert") {
            currentMode = "siaga";
            data_interval_ms = 30000;
            bellEnabled = true;
          }
          ok = true;
        }
        // Export/Force send data
        else if (cmd == "EXPORT") {
          readSensors();
          sendDataToGAS();
          ok = true;
        }
        // Restart ESP32
        else if (cmd == "RESTART") {
          ESP.restart();
        }
        // Factory reset
        else if (cmd == "FACTORY") {
          preferences.begin(PREFS_NAMESPACE, false);
          preferences.clear();
          preferences.end();
          ESP.restart();
        }
        // Stop buzzer
        else if (cmd == "STOP" || cmd == "OFF") {
          buzzerContinuous = false;
          ledcWrite(PWM_CHANNEL, 0);
          ok = true;
        }
      }
    }
    https.end();
    return ok;
  }

  // ================= WEB SERVER (STA MODE) =================
  String getSensorJSON() {
    String j = "{\"t\":" + String(t, 1) + ",\"h\":" + String(h, 1) +
               ",\"d\":" + String(dist, 1);
    j += ",\"l\":" + String(val_ldr) + ",\"g\":" + String(val_mq2);
    j += ",\"f\":" + String(val_flame); // + ",\"s\":" + String(val_sound);
    j += ",\"sa\":" + String(val_sound_ao);
    j += ",\"mq2do\":" + String(digitalRead(PIN_MQ2_DO));
    j += ",\"ldrdo\":" + String(digitalRead(PIN_LDR_DO));
    j += ",\"pol_mq2\":" + String(pol_mq2) +
         ",\"pol_flame\":" + String(pol_flame);
    j += ",\"pol_sound\":0,\"pol_ldr\":" + String(pol_ldr);
    j += ",\"rssi\":" + String(WiFi.RSSI());
    j += ",\"uptime\":" + String((millis() - bootTime) / 1000);
    j += ",\"heap\":" + String(ESP.getFreeHeap());
    j += ",\"buzzer\":" + String(buzzerContinuous ? 1 : 0);
    j += ",\"mq2_base\":" + String(mq2_baseline) +
         ",\"mq2_th\":" + String(mq2_threshold);
    j += ",\"ssid\":\"" + WiFi.SSID() + "\",\"ip\":\"" +
         WiFi.localIP().toString() + "\"";
    j += ",\"p\":" + String(peopleCount);
    j += ",\"bell\":" + String(bellEnabled ? 1 : 0);
    // Add current time if NTP synced
    if (ntpSynced) {
      struct tm ti;
      if (getLocalTime(&ti, 100)) {
        char timeBuf[9];
        snprintf(timeBuf, sizeof(timeBuf), "%02d:%02d:%02d", ti.tm_hour,
                 ti.tm_min, ti.tm_sec);
        j += ",\"time\":\"" + String(timeBuf) + "\"";
      }
    }
    j += "}";
    return j;
  }

  void setupWebServer() {
    // API endpoint - JSON sensor data
    server.on("/api/sensors", []() {
      // if (!server.authenticate(LOCAL_USER, LOCAL_PASS))
      //   return server.requestAuthentication();
      readSensors();
      server.send(200, "application/json", getSensorJSON());
    });

    // Command endpoint - OPTIMIZED for fast piano response
    server.on("/api/command", []() {
      String cmd = server.arg("cmd");
      Serial.printf("[CMD] Received: %s\n", cmd.c_str());
      
      if (cmd.startsWith("PLAY:")) {
        int musicId = cmd.substring(5).toInt();
        Serial.printf("[CMD] Playing music: %d\n", musicId);
        playMusic(musicId);
      }
      else if (cmd == "CALIBRATE") {
        autoCalibrate();
      }
      else if (cmd.startsWith("NOTE:")) {
        int sep = cmd.indexOf(':', 5);
        int freq = 0;
        int dur = 200;
        
        if (sep > 0) {
          freq = cmd.substring(5, sep).toInt();
          dur = cmd.substring(sep + 1).toInt();
        } else {
          freq = cmd.substring(5).toInt();
        }
        
        if (freq > 0) {
          Serial.printf("[CMD] Piano note: %d Hz, %d ms\n", freq, dur);
          if (dur > 0 && dur <= 2000) {
            playToneImmediate(freq, dur);
          } else {
            playToneImmediate(freq, 200);
          }
        }
      }
      else if (cmd.startsWith("TONE:")) {
        int val = cmd.substring(5).toInt();
        if (val == 1) {
          buzzerContinuous = true;
          ledcWriteTone(PWM_CHANNEL, 1000);
        } else {
          buzzerContinuous = false;
          ledcWrite(PWM_CHANNEL, 0);
        }
      }

      
      server.send(200, "application/json",
                  "{\"ok\":true,\"cmd\":\"" + cmd + "\"}");
    });

    // Root - Dashboard (Local)
    server.on("/", []() {
      server.send(200, "text/html", index_html);
    });

    // WiFi Settings page
    server.on("/wifi", []() {
      // if (!server.authenticate(LOCAL_USER, LOCAL_PASS))
      //   return server.requestAuthentication();
      preferences.begin(PREFS_NAMESPACE, true);
      String curSSID = preferences.getString(PREFS_KEY_SSID, DEFAULT_SSID);
      preferences.end();
      String html =
          R"rawhtml(<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>WiFi Settings</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:20px}
.c{max-width:500px;margin:0 auto}.card{background:#1e293b;border-radius:12px;padding:20px;margin-bottom:15px;border:1px solid #334155}
h1{text-align:center;color:#38bdf8;margin-bottom:20px}h2{color:#38bdf8;margin-bottom:15px}
input{width:100%;padding:10px;margin:5px 0 15px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:1em}
.btn{width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1em;margin-top:5px}
.btn:hover{background:#2563eb}.back{display:inline-block;color:#38bdf8;text-decoration:none;margin-top:15px}
.info{background:#334155;padding:10px;border-radius:8px;margin-bottom:15px;font-size:.9em}
</style></head><body><div class='c'>
<h1>📶 WiFi Settings</h1>
<div class='card'>
<div class='info'>Current SSID: <b>)rawhtml" +
          curSSID + R"rawhtml(</b><br>IP: <b>)rawhtml" +
          WiFi.localIP().toString() + R"rawhtml(</b><br>RSSI: <b>)rawhtml" +
          String(WiFi.RSSI()) + R"rawhtml( dBm</b><br>MAC: <b>)rawhtml" +
          WiFi.macAddress() + R"rawhtml(</b></div>
<h2>Ganti WiFi</h2>
<form action='/wifi/save' method='POST'>
<label>SSID:</label><input name='ssid' type='text' placeholder='Nama WiFi' required>
<label>Password:</label><input name='pass' type='password' placeholder='Password WiFi' required>
<button type='submit' class='btn'>💾 Simpan & Restart</button>
</form>
<a href='/' class='back'>← Kembali</a>
</div></div></body></html>)rawhtml";
      server.send(200, "text/html", html);
    });

    server.on("/wifi/save", HTTP_POST, []() {
      if (server.hasArg("ssid") && server.hasArg("pass")) {
        preferences.begin(PREFS_NAMESPACE, false);
        preferences.putString(PREFS_KEY_SSID, server.arg("ssid"));
        preferences.putString(PREFS_KEY_PASS, server.arg("pass"));
        preferences.end();
        server.send(
            200, "text/html",
            "<h2 style='color:#38bdf8;text-align:center;margin-top:50px'>✅ "
            "Tersimpan! Restarting...</h2>");
        delay(1500);
        ESP.restart();
      } else {
        server.send(400, "text/html", "Missing SSID/Password");
      }
    });

    // OTA Upload page
    server.on("/ota", []() {
      // if (!server.authenticate(LOCAL_USER, LOCAL_PASS))
      //   return server.requestAuthentication();
      String html =
          R"rawhtml(<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>OTA Update</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:20px}
.c{max-width:500px;margin:0 auto}.card{background:#1e293b;border-radius:12px;padding:20px;border:1px solid #334155}
h1{text-align:center;color:#38bdf8;margin-bottom:20px}h2{color:#38bdf8;margin-bottom:15px}
input[type=file]{width:100%;padding:10px;margin:10px 0;border:2px dashed #475569;border-radius:8px;background:#0f172a;color:#e2e8f0}
.btn{width:100%;padding:12px;background:#a855f7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1em;margin-top:10px}
.btn:hover{background:#9333ea}.back{display:inline-block;color:#38bdf8;text-decoration:none;margin-top:15px}
#prog{width:100%;height:20px;border-radius:10px;margin-top:15px;display:none}
.info{background:#334155;padding:10px;border-radius:8px;margin-bottom:15px;font-size:.9em}
</style></head><body><div class='c'>
<h1>📦 OTA Firmware Update</h1>
<div class='card'>
<div class='info'>⚠️ Upload file .bin firmware ESP32.<br>Device akan restart otomatis setelah update.</div>
<h2>Upload Firmware</h2>
<form method='POST' action='/ota/upload' enctype='multipart/form-data'>
<input type='file' name='firmware' accept='.bin' required>
<button type='submit' class='btn'>🚀 Upload & Update</button>
</form>
<progress id='prog' max='100' value='0'></progress>
<div id='status'></div>
<a href='/' class='back'>← Kembali</a>
</div></div></body></html>)rawhtml";
      server.send(200, "text/html", html);
    });

    server.on(
        "/ota/upload", HTTP_POST,
        []() {
          server.send(200, "text/html",
                      Update.hasError()
                          ? "<h2 "
                            "style='color:#ef4444;text-align:center;margin-top:"
                            "50px'>❌ Update GAGAL!</h2>"
                          : "<h2 "
                            "style='color:#22c55e;text-align:center;margin-top:"
                            "50px'>✅ Update BERHASIL! Restarting...</h2>");
          delay(1500);
          ESP.restart();
        },
        []() {
          HTTPUpload &upload = server.upload();
          if (upload.status == UPLOAD_FILE_START) {
            Serial.printf("[OTA] File: %s\n", upload.filename.c_str());
            if (!Update.begin(UPDATE_SIZE_UNKNOWN))
              Update.printError(Serial);
          } else if (upload.status == UPLOAD_FILE_WRITE) {
            if (Update.write(upload.buf, upload.currentSize) !=
                upload.currentSize)
              Update.printError(Serial);
          } else if (upload.status == UPLOAD_FILE_END) {
            if (Update.end(true))
              Serial.printf("[OTA] OK: %u bytes\n", upload.totalSize);
            else
              Update.printError(Serial);
          }
        });

    server.begin();
    Serial.println("[WEB] Server started on port " + String(STA_WEB_PORT));
  }

  // ================= AP MODE (WiFi Config) =================
  void setupAP() {
    isConfigMode = true;
    WiFi.mode(WIFI_AP);
    WiFi.softAP(AP_SSID, AP_PASS);

    server.on("/", []() {
      String html =
          R"rawhtml(<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>WiFi Setup</title><style>
body{font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:20px;display:flex;justify-content:center;align-items:center;min-height:100vh}
.card{background:#1e293b;border-radius:12px;padding:25px;max-width:400px;width:100%;border:1px solid #334155}
h2{color:#38bdf8;text-align:center;margin-bottom:20px}
input{width:100%;padding:10px;margin:5px 0 15px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#e2e8f0}
.btn{width:100%;padding:12px;background:#3b82f6;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:1em}
</style></head><body><div class='card'><h2>📶 Konfigurasi WiFi</h2>
<form action='/save' method='POST'>
<label>SSID:</label><input name='ssid' required>
<label>Password:</label><input name='pass' type='password' required>
<button type='submit' class='btn'>💾 Simpan</button></form></div></body></html>)rawhtml";
      server.send(200, "text/html", html);
    });

    server.on("/save", HTTP_POST, []() {
      if (server.hasArg("ssid") && server.hasArg("pass")) {
        preferences.begin(PREFS_NAMESPACE, false);
        preferences.putString(PREFS_KEY_SSID, server.arg("ssid"));
        preferences.putString(PREFS_KEY_PASS, server.arg("pass"));
        preferences.end();
        server.send(
            200, "text/html",
            "<h2 style='color:#38bdf8;text-align:center;margin-top:50px'>✅ "
            "Tersimpan! Restart...</h2>");
        delay(1500);
        ESP.restart();
      } else {
        server.send(400, "text/html", "Missing parameters!");
      }
    });

    dnsServer.start(53, "*", WiFi.softAPIP());
    server.onNotFound([]() {
      server.sendHeader("Location",
                        String("http://") + WiFi.softAPIP().toString(), true);
      server.send(302, "text/plain", "");
    });
    server.begin();
    Serial.println("[AP] Config mode at: 192.168.4.1");
  }

  // ================= OTA SETUP =================
  void setupOTA() {
    ArduinoOTA.setHostname(OTA_HOSTNAME);
    ArduinoOTA.setPassword(OTA_PASSWORD);
    ArduinoOTA.onStart([]() { Serial.println("[OTA] Start"); });
    ArduinoOTA.onEnd([]() { Serial.println("\n[OTA] End"); });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("[OTA] %u%%\r", (progress / (total / 100)));
    });
    ArduinoOTA.onError(
        [](ota_error_t error) { Serial.printf("[OTA] Error[%u]\n", error); });
    ArduinoOTA.begin();
    Serial.println("[OTA] Ready");
  }

  // ================= SETUP =================
  void setup() {
    Serial.begin(115200);
    bootTime = millis();
    setupBuzzer();
    playMusic(1);
    Serial.println("\n[SYS] Booting Smart Class IoT...");

    pinMode(PIN_TRIG, OUTPUT);
    pinMode(PIN_ECHO, INPUT);
    pinMode(PIN_FLAME, INPUT);
    // pinMode(PIN_SOUND, INPUT);
    pinMode(PIN_MQ2_DO, INPUT);
    pinMode(PIN_LDR_DO, INPUT);
    pinMode(PIN_LED, OUTPUT);
    digitalWrite(PIN_TRIG, LOW);
    digitalWrite(PIN_LED, LOW);
    dht.begin();

    // Load saved polarity
    preferences.begin(PREFS_NAMESPACE, true);
    pol_mq2 = preferences.getInt(PREFS_KEY_MQ2_POL, POLARITY_UNKNOWN);
    pol_flame = preferences.getInt(PREFS_KEY_FLAME_POL, POLARITY_UNKNOWN);
    // pol_sound = preferences.getInt(PREFS_KEY_SOUND_POL, POLARITY_UNKNOWN);
    pol_ldr = preferences.getInt(PREFS_KEY_LDR_POL, POLARITY_UNKNOWN);
    preferences.end();

    autoCalibrate();

    // WiFi
    preferences.begin(PREFS_NAMESPACE, true);
    String ssid = preferences.getString(PREFS_KEY_SSID, DEFAULT_SSID);
    String pass = preferences.getString(PREFS_KEY_PASS, DEFAULT_PASS);
    preferences.end();
    if (ssid.length() == 0) {
      ssid = DEFAULT_SSID;
      pass = DEFAULT_PASS;
    }

    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);
    WiFi.setAutoReconnect(true);
    WiFi.begin(ssid.c_str(), pass.c_str());
    Serial.print("[WIFI] Connecting: ");
    Serial.println(ssid);

    int retry = 0;
    while (WiFi.status() != WL_CONNECTED && retry < WIFI_MAX_RETRY) {
      delay(WIFI_RECONNECT_DELAY);
      Serial.print(".");
      retry++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[WIFI] OK IP: " + WiFi.localIP().toString());
      wifiConnected = true;
      playMusic(1);
      setupWebServer();
      setupOTA();

      // NTP Time Sync
      configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
      struct tm timeinfo;
      if (getLocalTime(&timeinfo, 5000)) {
        ntpSynced = true;
        Serial.printf("[NTP] Time: %02d:%02d:%02d\n", timeinfo.tm_hour,
                      timeinfo.tm_min, timeinfo.tm_sec);
      } else {
        Serial.println("[NTP] Sync failed, bell schedule may not work");
      }

      esp_task_wdt_init(WDT_TIMEOUT, true);
      esp_task_wdt_add(NULL);
    } else {
      Serial.println("\n[WIFI] GAGAL! Mode AP...");
      setupAP();
    }

    // PIR pin setup
    pinMode(PIN_PIR, INPUT);
  }

  // ================= BELL SCHEDULE =================
  void checkBellSchedule() {
    if (!bellEnabled || !ntpSynced)
      return;
    if (millis() - lastBellCheck < BELL_CHECK_INTERVAL)
      return;
    lastBellCheck = millis();

    struct tm timeinfo;
    if (!getLocalTime(&timeinfo, 1000))
      return;

    int currentMinute = timeinfo.tm_hour * 60 + timeinfo.tm_min;

    // Jangan trigger bel yang sama dalam menit yang sama
    if (currentMinute == lastBellMinute)
      return;

    for (int i = 0; i < BELL_COUNT; i++) {
      int schedMinute = BELL_SCHEDULE[i].hour * 60 + BELL_SCHEDULE[i].minute;
      if (currentMinute == schedMinute) {
        lastBellMinute = currentMinute;
        Serial.printf("[BELL] %s! (%02d:%02d) Music:%d\n",
                      BELL_SCHEDULE[i].label, BELL_SCHEDULE[i].hour,
                      BELL_SCHEDULE[i].minute, BELL_SCHEDULE[i].musicId);
        playMusic(BELL_SCHEDULE[i].musicId);
        break;
      }
    }
  }

  // ================= PIR PEOPLE COUNTER =================
  void checkPIR() {
    bool pirState = digitalRead(PIN_PIR);

    // Deteksi rising edge (LOW -> HIGH) dengan debounce
    if (pirState && !lastPirState &&
        (millis() - lastPirTrigger > PIR_DEBOUNCE_MS)) {
      peopleCount++;
      lastPirTrigger = millis();
      Serial.printf("[PIR] Motion detected! Count: %d\n", peopleCount);
    }
    lastPirState = pirState;
  }

  // ================= LOOP =================
  void loop() {
    if (isConfigMode) {
      dnsServer.processNextRequest();
      server.handleClient();
      return;
    }

    checkWiFiConnection();
    server.handleClient();
    if (otaEnabled)
      ArduinoOTA.handle();

    // PIR check setiap loop (harus cepat untuk deteksi akurat)
    checkPIR();

    if (wifiConnected) {
      esp_task_wdt_reset();

      // Bell schedule
      checkBellSchedule();

      if (millis() - lastCalibration > AUTO_CALIB_INTERVAL) {
        Serial.println("[CAL] Kalibrasi periodik...");
        autoCalibrate();
      }

      if (millis() - lastDataSend > data_interval_ms) {
        readSensors();
        sendDataToGAS();
        lastDataSend = millis();
      }

      if (millis() - lastCmdCheck > CMD_CHECK_INTERVAL) {
        checkCommand();
        lastCmdCheck = millis();
      }
    } else {
      delay(1000);
      esp_task_wdt_reset();
    }
  }
