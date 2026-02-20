/**
 * =====================================================
 * SMART CLASS IOT ADVANCED - Configuration File
 * =====================================================
 * Contains all pin definitions, WiFi credentials,
 * system configuration, thresholds, and constants
 * =====================================================
 */

#ifndef SMART_CLASS_CONFIG_H
#define SMART_CLASS_CONFIG_H

// ================= KONFIGURASI PIN =================
#define PIN_DHT 18
#define PIN_BUZZER 26
#define PIN_TRIG 5
#define PIN_ECHO 19
#define PIN_LDR 34    // Analog Input (Input Only)
#define PIN_LDR_DO 25 // Digital Input untuk Sinkronisasi
#define PIN_MQ2 35    // Analog Input (Input Only)
#define PIN_MQ2_DO 27 // Digital Input untuk Sinkronisasi
#define PIN_FLAME 33
// #define PIN_SOUND 32    // Sound DO (Digital) - Nonaktif
#define PIN_SOUND_AO 32 // Sound AO (Analog) - sama pin, ESP32 bisa analog
#define PIN_LED 2
#define PIN_PIR 4 // PIR Motion Sensor (People Counter)

// ================= KONFIGURASI WIFI DEFAULT =================
#define DEFAULT_SSID "ELSON"
#define DEFAULT_PASS "elson250129"

// ================= SECURITY =================
#define GAS_API_KEY "SmartClassSecret2024" // Ganti sesuai keinginan
#define LOCAL_USER "admin"
#define LOCAL_PASS "admin123"

// ================= KONFIGURASI SISTEM =================
#define DHTTYPE DHT22
#define WDT_TIMEOUT 60
#define PWM_CHANNEL 0
#define PWM_RES 8
#define PWM_FREQ 2000
#define SAMPLES_COUNT 20 // Algoritma Anti-Noise: 20 data per pembacaan

// ================= GOOGLE APPS SCRIPT =================
#define GAS_ID                                                                 \
  "AKfycbyxg3Ol1pkk9Kcr7HYjy0NzBE7fjs36QFGMsrN6K3BXyohw9gX6nuys2aXOc5njZOB2"
#define DEVICE_NAME "ESP32_1"

// ================= OTA & WEB SERVER =================
#define OTA_HOSTNAME "ESP32-SmartClass"
#define OTA_PASSWORD "smartclass123"
#define AP_SSID "ESP32-SMART-CLASS"
#define AP_PASS "12345678"
#define STA_WEB_PORT 80

// ================= DO POLARITY AUTO-DETECT =================
// Saat kalibrasi di kondisi aman, baca DO pin:
// Jika DO=LOW di kondisi aman → LOW=aman, HIGH=bahaya (active HIGH)
// Jika DO=HIGH di kondisi aman → HIGH=aman, LOW=bahaya (active LOW)
#define POLARITY_UNKNOWN -1
#define POLARITY_ACTIVE_LOW 0  // 0=bahaya (sensor aktif LOW saat deteksi)
#define POLARITY_ACTIVE_HIGH 1 // 1=bahaya (sensor aktif HIGH saat deteksi)

// ================= THRESHOLD KONFIGURASI =================
#define MQ2_THRESHOLD_DEFAULT 800 // Selisih kenaikan gas untuk trigger alarm
#define MQ2_THRESHOLD_HIGH 1200   // Threshold tinggi untuk lingkungan bergas
#define FLAME_DETECTION_LOW 0     // Default: Flame detected = LOW
#define SOUND_DETECTION_HIGH 1    // Default: Sound detected = HIGH

// ================= SENSOR BOUNDS =================
#define TEMP_MIN -40.0f
#define TEMP_MAX 80.0f
#define HUMID_MIN 0.0f
#define HUMID_MAX 100.0f
#define DIST_MIN 0.0f
#define DIST_MAX 400.0f // cm (max ultrasonic range)
#define LDR_MIN 0
#define LDR_MAX 4095 // 12-bit ADC
#define MQ2_MIN 0
#define MQ2_MAX 4095 // 12-bit ADC

// ================= TIMING KONFIGURASI =================
#define DATA_SEND_INTERVAL 30000     // 30 detik
#define CMD_CHECK_INTERVAL 5000      // 5 detik
#define WIFI_RECONNECT_DELAY 500     // 500ms
#define WIFI_MAX_RETRY 20
#define SENSOR_READ_DELAY 2 // ms between analog reads

// ================= CALIBRATION =================
#define CALIBRATION_SAMPLES 50
#define CALIBRATION_DURATION 200    // ms per sample
#define AUTO_CALIB_INTERVAL 3600000 // 1 jam

// ================= NADA MUSIK (Hz) =================
// Note frequencies for buzzer
#define NOTE_REST 0
#define NOTE_C3 131
#define NOTE_D3 147
#define NOTE_E3 165
#define NOTE_F3 175
#define NOTE_G3 196
#define NOTE_A3 220
#define NOTE_B3 247
#define NOTE_C4 262
#define NOTE_CS4 277
#define NOTE_D4 294
#define NOTE_DS4 311
#define NOTE_E4 330
#define NOTE_F4 349
#define NOTE_FS4 370
#define NOTE_G4 392
#define NOTE_GS4 415
#define NOTE_A4 440
#define NOTE_AS4 466
#define NOTE_B4 494
#define NOTE_C5 523
#define NOTE_CS5 554
#define NOTE_D5 587
#define NOTE_DS5 622
#define NOTE_E5 659
#define NOTE_F5 698
#define NOTE_FS5 740
#define NOTE_G5 784
#define NOTE_GS5 831
#define NOTE_A5 880
#define NOTE_AS5 932
#define NOTE_B5 988
#define NOTE_C6 1047
#define NOTE_D6 1175
#define NOTE_E6 1319
#define NOTE_F6 1397
#define NOTE_G6 1568
#define NOTE_A6 1760

// ================= PREFS KEYS =================
#define PREFS_NAMESPACE "iot-config"
#define PREFS_KEY_SSID "ssid"
#define PREFS_KEY_PASS "pass"
#define PREFS_KEY_MQ2_POL "mq2pol"
#define PREFS_KEY_FLAME_POL "flamepol"
#define PREFS_KEY_SOUND_POL "soundpol"
#define PREFS_KEY_LDR_POL "ldrpol"

// ================= HTTP CONFIG =================
#define HTTP_TIMEOUT 10000 // 10 seconds
#define HTTP_RETRY 3

// ================= NTP CONFIG =================
#define NTP_SERVER "pool.ntp.org"
#define GMT_OFFSET_SEC 25200 // UTC+7 (WIB)
#define DAYLIGHT_OFFSET_SEC 0

// ================= BELL SCHEDULE =================
#define BELL_CHECK_INTERVAL 30000 // 30 detik
#define TOTAL_MUSIC 25

struct BellEntry {
  int hour;
  int minute;
  int musicId;
  const char *label;
};

const BellEntry BELL_SCHEDULE[] = {{10, 15, 21, "Istirahat"},
                                   {10, 30, 20, "Masuk Kelas"},
                                   {12, 0, 21, "ISHOMA"},
                                   {12, 30, 20, "Masuk Kelas"}};
const int BELL_COUNT = sizeof(BELL_SCHEDULE) / sizeof(BELL_SCHEDULE[0]);

// ================= PIR CONFIG =================
#define PIR_DEBOUNCE_MS 3000 // 3 detik debounce antar deteksi

#endif // SMART_CLASS_CONFIG_H
