/**
 * SMART CLASS IOT - Google Apps Script (Multi-Kelas)
 * Handles data from multiple ESP32 classes, provides API + web dashboard
 */

// ================= KONFIGURASI MULTI-KELAS =================
const KELAS_CONFIG = {
  // Satu Spreadsheet dengan banyak sheet (beda kelas)
  SPREADSHEET_ID: '1hp3qIpknnBKUXElR5Bn2uiyYCiiY3tB4CHNEzua-k_8',
  API_KEY: 'SmartClassSecret2024',
  
  // Semua kelas yang terdaftar
  kelas: {
    'XIPA1': { nama: 'X IPA 1', deviceId: 'ESP32_XIPA1', sheetName: 'XIPA1', ip: '192.168.1.101' },
    'XIPA2': { nama: 'X IPA 2', deviceId: 'ESP32_XIPA2', sheetName: 'XIPA2', ip: '192.168.1.102' },
    'XIPS1': { nama: 'X IPS 1', deviceId: 'ESP32_XIPS1', sheetName: 'XIPS1', ip: '192.168.1.103' },
    'XIPS2': { nama: 'X IPS 2', deviceId: 'ESP32_XIPS2', sheetName: 'XIPS2', ip: '192.168.1.104' }
  },
  
  // User management
  users: {
    'admin': { pass: 'admin123', role: 'admin', akses: ['all'] },
    'guru_xipa1': { pass: 'guru123', role: 'guru', akses: ['XIPA1'] },
    'guru_xipa2': { pass: 'guru123', role: 'guru', akses: ['XIPA2'] },
    'guru_xips1': { pass: 'guru123', role: 'guru', akses: ['XIPS1'] },
    'guru_xips2': { pass: 'guru123', role: 'guru', akses: ['XIPS2'] },
    'siswa': { pass: 'siswa123', role: 'siswa', akses: ['all'] }
  }
};

// Backwards compatibility
const SPREADSHEET_ID = KELAS_CONFIG.SPREADSHEET_ID;
const SHEET_NAME = 'ESP32';
const API_KEY = KELAS_CONFIG.API_KEY;
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// ================= doGet =================
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getCommand') return handleGetCommand(e.parameter.device);
  if (action === 'getStatus') return handleGetStatus();
  if (action === 'getLatest') return handleGetLatest();
  if (action === 'getHistory') return handleGetHistory(e.parameter.limit);
  if (action === 'getConfig') return handleGetConfig();
  
  // Default: serve web dashboard (Index.html)
  var template = HtmlService.createTemplateFromFile('Index');
  try {
    template.gasId = ScriptApp.getService().getUrl();
  } catch(err) {
    template.gasId = 'https://script.google.com/macros/s/AKfycbyxg3Ol1pkk9Kcr7HYjy0NzBE7fjs36QFGMsrN6K3BXyohw9gX6nuys2aXOc5njZOB2/exec';
  }
  return template.evaluate()
    .setTitle('Smart Class IoT Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ================= doPost =================
function doPost(e) {
  try {
    Logger.log('doPost called. Raw body: ' + e.postData.contents);
    const data = JSON.parse(e.postData.contents);
    Logger.log('Parsed data: ' + JSON.stringify(data));

    // Handle Telegram webhook payload (no API key required)
    if (isTelegramUpdate(data)) {
      return handleTelegramWebhook(data);
    }
    
    // 1. Verify API Key (Security)
    if (data.key !== API_KEY) {
      Logger.log('UNAUTHORIZED ACCESS: Invalid Key');
      return jsonResponse({ status: 'error', message: 'Unauthorized' });
    }
    
    if (data.action === 'setCommand') {
      return handleSetCommand(data.command, data.device);
    }
    
    // Default: save sensor data
    const saved = saveSensorData(data);
    Logger.log('Data saved: ' + saved);
    
    // Check for danger & send Telegram alert
    // Note: ESP32 sends 'sa' (sound analog), not 's' (sound digital)
    const soundDanger = data.sa > 800; // Threshold for loud sound
    if (data.f === 0 || data.g > 800 || soundDanger) {
      Logger.log('DANGER detected! f=' + data.f + ' g=' + data.g + ' sa=' + data.sa);
      sendDangerAlert(data);
    }

    
    return jsonResponse({ status: 'success', message: 'Data received', timestamp: new Date().toISOString() });
  } catch (error) {
    Logger.log('doPost ERROR: ' + error.message + ' | Stack: ' + error.stack);
    return jsonResponse({ status: 'error', message: error.message });
  }
}

function isTelegramUpdate(data) {
  return !!(data && (data.message || data.edited_message || data.callback_query));
}

function handleTelegramWebhook(update) {
  try {
    const msg = update.message || update.edited_message;
    if (!msg || !msg.text) return jsonResponse({ status: 'ignored', reason: 'no_text' });

    const text = msg.text.trim();
    if (!text.startsWith('/')) return jsonResponse({ status: 'ignored', reason: 'not_command' });

    // Telegram can send command format: /status@botname
    const firstSpace = text.indexOf(' ');
    const firstToken = (firstSpace >= 0 ? text.substring(0, firstSpace) : text).trim();
    const commandToken = firstToken.includes('@') ? firstToken.split('@')[0] : firstToken;
    const arg = firstSpace >= 0 ? text.substring(firstSpace + 1).trim() : '';
    const normalizedCmd = commandToken + (arg ? ' ' + arg : '');

    const reply = tgHandleCommand(normalizedCmd);
    sendTelegramMessage(reply);

    return jsonResponse({ status: 'ok', handled: normalizedCmd });
  } catch (err) {
    Logger.log('Telegram webhook error: ' + err.message);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ================= Helper =================
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ================= Save Sensor Data =================
function saveSensorData(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(['Timestamp', 'Device', 'Temperature', 'Humidity', 'Distance', 'LDR', 'MQ2', 'Flame', 'Sound', 'SoundAO', 'MQ2_DO', 'LDR_DO', 'Pol_MQ2', 'Pol_Flame', 'RSSI', 'Uptime', 'PeopleCount']);
    }
    
    sheet.appendRow([
      new Date().toISOString(),
      data.device || '', data.t || 0, data.h || 0,
      data.d || 0, data.l || 0, data.g || 0,
      data.f || 0, data.s || 0, data.sa || 0,
      data.mq2do || '', data.ldrdo || '',
      data.pol_mq2 || '', data.pol_flame || '',
      data.rssi || '', data.uptime || '',
      data.p || 0
    ]);
    
    // Keep last 10000 rows
    const lastRow = sheet.getLastRow();
    if (lastRow > 10000) sheet.deleteRows(2, lastRow - 10000);
    
    return true;
  } catch (error) {
    Logger.log('Save error: ' + error.message);
    return false;
  }
}

// ================= Command Storage (PropertiesService) =================
function handleSetCommand(cmd, device) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('command_' + (device || 'ESP32_1'), cmd);
  return jsonResponse({ status: 'success', cmd: cmd });
}

// ================= ADMIN LOGIN =================
function login(u, p) {
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    return { ok: true, token: Utilities.getUuid() }; // Simple token simulation
  }
  return { ok: false };
}

function handleGetCommand(device) {
  const props = PropertiesService.getScriptProperties();
  const key = 'command_' + (device || 'ESP32_1');
  const command = props.getProperty(key) || '';
  
  // Clear after reading
  if (command) props.deleteProperty(key);
  
  return jsonResponse({
    command: command,
    device: device,
    timestamp: new Date().toISOString()
  });
}

// ================= Get Status =================
function handleGetStatus() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({ status: 'no_data' });
    
    const lastRow = sheet.getLastRow();
    const lastData = sheet.getRange(lastRow, 1, 1, 17).getValues()[0];
    
    return jsonResponse({
      status: 'success',
      data: {
        timestamp: lastData[0], device: lastData[1],
        temperature: lastData[2], humidity: lastData[3],
        distance: lastData[4], ldr: lastData[5],
        mq2: lastData[6], flame: lastData[7], sound: lastData[8],
        soundAO: lastData[9],
        mq2do: lastData[10], ldrdo: lastData[11],
        pol_mq2: lastData[12], pol_flame: lastData[13],
        rssi: lastData[14], uptime: lastData[15],
        peopleCount: lastData[16]
      }
    });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.message });
  }
}

// ================= Get Latest (all fields) =================
function handleGetLatest() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({ status: 'no_data' });
    
    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const result = {};
    headers.forEach((h, i) => { result[h] = data[i]; });
    
    // Also get total row count
    result['totalRecords'] = lastRow - 1;
    result['lastUpdate'] = data[0];
    
    return jsonResponse({ status: 'success', data: result });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.message });
  }
}

// ================= Get History =================
function handleGetHistory(limit) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return jsonResponse({ status: 'no_data' });
    
    const lastRow = sheet.getLastRow();
    const numRows = Math.min(limit || 100, lastRow - 1);
    if (numRows <= 0) return jsonResponse({ status: 'no_data' });
    
    const startRow = Math.max(2, lastRow - numRows + 1);
    const data = sheet.getRange(startRow, 1, numRows, 15).getValues();
    
    return jsonResponse({
      status: 'success',
      count: numRows,
      data: data.map(row => ({
        timestamp: row[0], device: row[1],
        temperature: row[2], humidity: row[3],
        distance: row[4], ldr: row[5],
        mq2: row[6], flame: row[7], sound: row[8],
        mq2do: row[9], ldrdo: row[10],
        pol_mq2: row[11], pol_flame: row[12],
        rssi: row[13], uptime: row[14]
      }))
    });
  } catch (error) {
    return jsonResponse({ status: 'error', message: error.message });
  }
}

// ================= Get Config =================
function handleGetConfig() {
  return jsonResponse({
    status: 'success',
    config: {
      deviceName: 'ESP32_1',
      dataInterval: 30000,
      calibrationInterval: 3600000,
      thresholds: { mq2Default: 800, mq2High: 1200 }
    }
  });
}

// ================= Web Dashboard (separate HTML) =================
function handleWebDashboard() {
  const template = HtmlService.createTemplateFromFile('Index');
  template.gasId = ScriptApp.getService().getUrl().split('/s/')[1].split('/')[0];
  return template.evaluate()
    .setTitle('Smart Class IoT Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ================= Telegram Configuration =================
const TELEGRAM_BOT_TOKEN = '8324067380:AAHfMtWfLdtoYByjnrm2sgy90z3y01V6C-I';
const TELEGRAM_CHAT_ID = '6383896382';

// ================= Telegram Command Router =================
const TG_ROUTE = {
  'status': tgCmdStatus,
  'sensors': tgCmdSensors,
  'health': tgCmdHealth,
  'uptime': tgCmdUptime,
  'pinmap': tgCmdPinmap,
  'time': tgCmdTime,
  'alarm': tgCmdAlarm,
  'stop': tgCmdStop,
  'buzzer': tgCmdBuzzer,
  'threshold': tgCmdThreshold,
  'calibrate': tgCmdCalibrate,
  'mode': tgCmdMode,
  'sleep': tgCmdSleep,
  'wifi': tgCmdWifi,
  'scanwifi': tgCmdScanWifi,
  'netstat': tgCmdNetstat,
  'debug': tgCmdDebug,
  'restart': tgCmdRestart,
  'update': tgCmdUpdate,
  'export': tgCmdExport,
  'reset': tgCmdReset,
  'sendtg': tgCmdSendTG,
  'history': tgCmdHistory,
  'summary': tgCmdSummary,
  'log': tgCmdLog,
  'factory': tgCmdFactory,
  'help': tgCmdHelp
};

function tgHandleCommand(command) {
  const parts = command.split(' ');
  const cmd = parts[0].replace('/', '').toLowerCase();
  const arg = parts.slice(1).join(' ');
  
  Logger.log('TG Command: ' + cmd + ' Args: ' + arg);
  
  if (TG_ROUTE[cmd]) {
    return TG_ROUTE[cmd](arg);
  }
  
  return '❌ Command /' + cmd + ' tidak dikenal.\nKetik /help untuk melihat daftar command.';
}

// ================= Telegram Command Handlers =================
function tgCmdStatus(arg) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '❌ Tidak ada data';
    const lastData = sheet.getRange(sheet.getLastRow(), 1, 1, 17).getValues()[0];
    return '📊 <b>STATUS</b>\n\n' +
      'Device: ' + lastData[1] + '\n' +
      'Suhu: ' + lastData[2] + '°C\n' +
      'Kelembaban: ' + lastData[3] + '%\n' +
      'MQ2: ' + lastData[6] + '\n' +
      'Flame: ' + (lastData[7] == 0 ? 'DETEKSI!' : 'Aman') + '\n' +
      'RSSI: ' + lastData[14] + ' dBm\n' +
      'Uptime: ' + lastData[15] + ' dtk\n' +
      'Pengunjung: ' + lastData[16];
  } catch(e) { return '❌ Error: ' + e.message; }
}

function tgCmdSensors(arg) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '❌ Tidak ada data';
    const d = sheet.getRange(sheet.getLastRow(), 1, 1, 17).getValues()[0];
    return '📟 <b>SENSOR</b>\n\n' + 'Suhu: ' + d[2] + '°C\n' + 'Humidity: ' + d[3] + '%\n' + 'Distance: ' + d[4] + ' cm\n' + 'LDR: ' + d[5] + '\n' + 'Gas MQ2: ' + d[6] + '\n' + 'Flame: ' + d[7] + '\n' + 'Sound: ' + d[9];
  } catch(e) { return '❌ Error: ' + e.message; }
}

function tgCmdHealth(arg) { return '💊 <b>HEALTH</b>\n\nFree RAM: OK\nCPU: ESP32\nWiFi: Connected'; }
function tgCmdUptime(arg) { 
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '❌ Tidak ada data';
    const up = sheet.getRange(sheet.getLastRow(), 16, 1, 1).getValues()[0][0];
    const days = Math.floor(up/86400), hours = Math.floor((up%86400)/3600), mins = Math.floor((up%3600)/60);
    return '⏱️ Uptime: ' + days + ' hari, ' + hours + ' jam, ' + mins + ' menit (' + up + ' dtk)';
  } catch(e) { return '❌ Error: ' + e.message; }
}
function tgCmdPinmap(arg) { return '🗺️ <b>PIN MAP</b>\n\nDHT22: GPIO 18\nBuzzer: GPIO 26\nTrig: GPIO 5\nEcho: GPIO 19\nLDR: GPIO 34\nMQ2: GPIO 35\nFlame: GPIO 33\nSound: GPIO 32\nLED: GPIO 2\nPIR: GPIO 4'; }
function tgCmdTime(arg) { return '🕐 Waktu Server: ' + new Date().toLocaleString('id-ID', {timeZone: 'Asia/Jakarta'}); }
function tgCmdAlarm(arg) { setCommandForDevice('PLAY:2'); return '🔔 Alarm dikirim ke ESP32...'; }
function tgCmdStop(arg) { setCommandForDevice('PLAY:0'); return '🛑 Alarm dimatikan!'; }

function tgCmdBuzzer(arg) {
  if (!arg) return '📝 Usage: /buzzer [0-24]\nContoh: /buzzer 6';
  const id = parseInt(arg);
  if (id >= 0 && id <= 24) { setCommandForDevice('PLAY:' + id); return '🎵 Playing music ID ' + id; }
  return '❌ ID harus 0-24';
}

function tgCmdThreshold(arg) {
  if (!arg) return '📝 Usage: /threshold [nilai]';
  setCommandForDevice('THRESHOLD:' + arg);
  return '⚠️ Threshold MQ2: ' + arg;
}

function tgCmdCalibrate(arg) { setCommandForDevice('CALIBRATE'); return '🔧 Kalibrasi sensor...'; }

function tgCmdMode(arg) {
  if (!arg) return '📝 Usage: /mode [normal|hemat|siaga]';
  arg = arg.toLowerCase();
  if (['normal','hemat','siaga'].includes(arg)) { setCommandForDevice('MODE:' + arg); return '⚙️ Mode: ' + arg; }
  return '❌ Mode: normal, hemat, siaga';
}

function tgCmdSleep(arg) { setCommandForDevice('MODE:hemat'); return '😴 Mode hemat daya!'; }
function tgCmdWifi(arg) { return '📶 WiFi: ' + getWifiSSID() + '\nRSSI: ' + getLastRSSI() + ' dBm'; }
function getWifiSSID() { return 'ELSON'; }
function getLastRSSI() { try { const ss = SpreadsheetApp.openById(SPREADSHEET_ID); const s = ss.getSheetByName(SHEET_NAME); return s && s.getLastRow()>1 ? s.getRange(s.getLastRow(),15,1,1).getValues()[0][0] : -100; } catch(e) { return -100; } }
function tgCmdScanWifi(arg) { return '📡 Scan WiFi perlu ESP32.\nKetik /wifi untuk info koneksi.'; }
function tgCmdNetstat(arg) { return '🌐 Network: WiFi OK\nServer: Sheets OK\nTelegram: Active'; }
function tgCmdDebug(arg) { const p = PropertiesService.getScriptProperties(); const c = p.getProperty('debug_mode')||'false'; p.setProperty('debug_mode',c==='false'?'true':'false'); return '🔧 Debug: ' + (c==='false'?'ON':'OFF'); }
function tgCmdRestart(arg) { setCommandForDevice('RESTART'); return '🔄 Merestart ESP32...'; }
function tgCmdUpdate(arg) { return '📦 OTA: http://IP-ESP32/ota'; }
function tgCmdExport(arg) { setCommandForDevice('EXPORT'); return '📤 Mengirim data...'; }

function tgCmdReset(arg) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (sheet && sheet.getLastRow() > 1) { sheet.deleteRows(2, sheet.getLastRow()-1); return '🗑️ Data dihapus!'; }
    return '❌ Tidak ada data';
  } catch(e) { return '❌ Error: ' + e.message; }
}

function tgCmdSendTG(arg) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '❌ Tidak ada data';
    const startRow = Math.max(2, sheet.getLastRow() - 9);
    const data = sheet.getRange(startRow, 1, sheet.getLastRow()-startRow+1, 5).getValues();
    let msg = '📋 <b>DATA TERAKHIR</b>\n\n';
    data.forEach((row, i) => { msg += (i+1) + '. ' + row[0].toString().substring(0,16) + ' | ' + row[2] + '°C | ' + row[3] + '%\n'; });
    sendTelegramMessage(msg);
    return '📤 Dikirim ke Telegram!';
  } catch(e) { return '❌ Error: ' + e.message; }
}

function tgCmdHistory(arg) {
  try {
    const limit = Math.max(1, Math.min(parseInt(arg || '10', 10) || 10, 20));
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '❌ Tidak ada data';

    const startRow = Math.max(2, sheet.getLastRow() - limit + 1);
    const data = sheet.getRange(startRow, 1, sheet.getLastRow() - startRow + 1, 17).getValues();

    let msg = '📚 <b>HISTORY ' + data.length + ' DATA TERAKHIR</b>\n\n';
    data.forEach((row, i) => {
      msg += (i + 1) + '. ' + row[0].toString().substring(0, 16) +
        ' | 🌡️' + row[2] + '°C | 💧' + row[3] + '% | 💨' + row[6] + ' | 🔥' + (row[7] == 0 ? 'Ya' : 'Tidak') + '\n';
    });
    return msg;
  } catch (e) {
    return '❌ Error: ' + e.message;
  }
}

function tgCmdSummary(arg) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '❌ Tidak ada data';

    const count = sheet.getLastRow() - 1;
    const startRow = Math.max(2, sheet.getLastRow() - Math.min(count, 100) + 1);
    const data = sheet.getRange(startRow, 1, sheet.getLastRow() - startRow + 1, 17).getValues();

    const avgTemp = data.reduce((s, r) => s + Number(r[2] || 0), 0) / data.length;
    const avgHum = data.reduce((s, r) => s + Number(r[3] || 0), 0) / data.length;
    const maxGas = data.reduce((m, r) => Math.max(m, Number(r[6] || 0)), 0);
    const flameCount = data.filter(r => Number(r[7]) === 0).length;
    const last = data[data.length - 1];

    return '📈 <b>SUMMARY MONITORING</b>\n\n' +
      'Total Data: ' + count + '\n' +
      'Rata2 Suhu: ' + avgTemp.toFixed(1) + '°C\n' +
      'Rata2 Humidity: ' + avgHum.toFixed(1) + '%\n' +
      'Gas Tertinggi: ' + maxGas + '\n' +
      'Deteksi Flame: ' + flameCount + ' kali\n' +
      'Update Terakhir: ' + last[0];
  } catch (e) {
    return '❌ Error: ' + e.message;
  }
}

function tgCmdLog(arg) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return '📜 Log kosong';
    const d = sheet.getRange(sheet.getLastRow(), 1, 1, 17).getValues()[0];
    return '📜 <b>LOG TERAKHIR</b>\n\n' +
      'Waktu: ' + d[0] + '\n' +
      'Device: ' + d[1] + '\n' +
      'Temp/Hum: ' + d[2] + '°C / ' + d[3] + '%\n' +
      'Gas/Flame/Sound: ' + d[6] + ' / ' + d[7] + ' / ' + d[9] + '\n' +
      'RSSI: ' + d[14] + ' dBm';
  } catch (e) {
    return '❌ Error: ' + e.message;
  }
}
function tgCmdFactory(arg) { const p = PropertiesService.getScriptProperties(); p.deleteProperty('wifi_ssid'); p.deleteProperty('wifi_pass'); setCommandForDevice('FACTORY'); return '🏭 Factory reset!'; }

function tgCmdHelp(arg) {
  return `🏫 <b>SMART CLASS IOT</b>

📊 MONITORING
/status - Status lengkap
/sensors - Data sensor  
/health - Info sistem
/uptime - Lama aktif
/pinmap - Konfigurasi pin
/time - Waktu server

🔔 KONTROL
/alarm - Test alarm
/stop - Matikan alarm
/buzzer X - Mainkan musik (0-24)
/threshold X - Set MQ2
/calibrate - Kalibrasi
/mode X - Mode (normal/hemat/siaga)
/sleep - Hemat daya

🌐 JARINGAN
/wifi - Info WiFi
/scanwifi - Scan jaringan
/netstat - Status koneksi
/debug - Toggle debug
/restart - Reboot
/update - OTA update

📊 DATA
/export - Kirim ke Sheet
/reset - Hapus data
/sendtg - Kirim ke Telegram
/history - Riwayat data terakhir
/summary - Ringkasan statistik
/log - Lihat log
/factory - Reset konfigurasi`;
}

// ================= Helper Functions =================
function setCommandForDevice(cmd, device) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('command_' + (device || 'ESP32_1'), cmd);
  Logger.log('Command set: ' + cmd);
}

function sendTelegramMessage(message) {
  try {
    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    const options = { method: 'POST', contentType: 'application/json', payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' }), muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (!result.ok) { Logger.log('TG error: ' + result.description); return false; }
    return true;
  } catch (e) { Logger.log('TG fetch: ' + e.message); return false; }
}

function sendDangerAlert(data) {
  let msg = '⚠️ <b>DANGER!</b>\nDevice: ' + data.device + '\n';
  if (data.f === 0) msg += '🔥 FLAME DETECTED!\n';
  if (data.g > 800) msg += '💨 HIGH GAS: ' + data.g + '\n';
  if (data.sa > 800) msg += '🔊 LOUD SOUND: ' + data.sa + '\n';
  sendTelegramMessage(msg);
}


// ================= Alert Trigger =================
function setupTrigger() {
  ScriptApp.newTrigger('checkAlerts').timeBased().everyMinutes(1).create();
}

function checkAlerts() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet || sheet.getLastRow() < 2) return;
    
    const lastData = sheet.getRange(sheet.getLastRow(), 1, 1, 17).getValues()[0];
    // Column indices: 0=Timestamp, 1=Device, 2=Temp, 3=Humid, 4=Dist, 5=LDR, 6=MQ2, 7=Flame, 8=Sound, 9=SoundAO
    const data = { device: lastData[1], f: lastData[7], g: lastData[6], sa: lastData[9] };
    
    // Check danger conditions: Flame=0, Gas>1200, Sound Analog>800
    if (data.f === 0 || data.g > 1200 || data.sa > 800) sendDangerAlert(data);
  } catch (e) {
    Logger.log('Alert error: ' + e.message);
  }
}


// ================= TEST FUNCTIONS (run manually in editor) =================
function testSaveData() {
  const testData = {
    device: 'ESP32_TEST',
    t: 28.5, h: 65, d: 120, l: 512, g: 300,
    f: 1, s: 0, mq2do: 'LOW', ldrdo: 'HIGH',
    pol_mq2: 0, pol_flame: 0, rssi: -55, uptime: 3600
  };
  Logger.log('=== TEST SAVE DATA ===');
  const result = saveSensorData(testData);
  Logger.log('Save result: ' + result);
}

function debugSaveData() {
  Logger.log('=== DEBUG SAVE ===');
  Logger.log('SPREADSHEET_ID: ' + SPREADSHEET_ID);
  Logger.log('SHEET_NAME: ' + SHEET_NAME);
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Spreadsheet name: ' + ss.getName());
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
  
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('Sheet "' + SHEET_NAME + '" NOT FOUND! Creating...');
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Device', 'Temperature', 'Humidity', 'Distance', 'LDR', 'MQ2', 'Flame', 'Sound', 'MQ2_DO', 'LDR_DO', 'Pol_MQ2', 'Pol_Flame', 'RSSI', 'Uptime']);
  }
  
  Logger.log('Sheet found: ' + sheet.getName());
  Logger.log('Rows BEFORE: ' + sheet.getLastRow());
  
  sheet.appendRow([
    new Date().toISOString(),
    'DEBUG_TEST', 99.9, 88.8, 77.7, 666, 555, 1, 0,
    'LOW', 'HIGH', 0, 0, -50, 9999
  ]);
  
  SpreadsheetApp.flush(); // Force write to sheet
  
  Logger.log('Rows AFTER: ' + sheet.getLastRow());
  
  // Read back
  const lastRow = sheet.getLastRow();
  const verify = sheet.getRange(lastRow, 1, 1, 5).getValues()[0];
  Logger.log('Verify last row: ' + JSON.stringify(verify));
  Logger.log('=== DEBUG DONE ===');
}

function testTelegram() {
  Logger.log('=== TEST TELEGRAM ===');
  const result = sendTelegramMessage('🧪 <b>TEST</b>\nSmart Class IoT Telegram test at ' + new Date().toISOString());
  Logger.log('Telegram result: ' + result);
}

function testDoPost() {
  Logger.log('=== TEST doPost ===');
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        device: 'ESP32_TEST', t: 30, h: 70, d: 100,
        l: 400, g: 500, f: 1, s: 0,
        mq2do: 'LOW', ldrdo: 'HIGH',
        pol_mq2: 0, pol_flame: 0, rssi: -60, uptime: 7200
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log('doPost result: ' + result.getContent());
}
