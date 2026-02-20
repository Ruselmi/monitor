#ifndef WEB_PAGE_H
#define WEB_PAGE_H

#include <Arduino.h>

const char index_html[] PROGMEM = R"rawhtml(
<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>
<title>Smart Class IoT</title><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui;background:#0f172a;color:#e2e8f0;padding:15px}
.c{max-width:800px;margin:0 auto}h1{text-align:center;color:#38bdf8;margin:10px 0 20px;font-size:1.5em}
.card{background:#1e293b;border-radius:12px;padding:15px;margin-bottom:15px;border:1px solid #334155}
.card h2{color:#38bdf8;font-size:1.1em;margin-bottom:10px;border-bottom:1px solid #334155;padding-bottom:8px}
.g{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.sb{background:#334155;padding:12px;border-radius:8px;text-align:center}
.sb .v{font-size:1.5em;font-weight:bold;color:#38bdf8}.sb .l{font-size:.75em;color:#94a3b8;margin-top:4px}
.sb.warn{border:2px solid #f59e0b}.sb.danger{border:2px solid #ef4444;animation:p 1s infinite}
@keyframes p{50%{transform:scale(1.03)}}
.bg{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.bg button{padding:8px 14px;border:none;border-radius:6px;cursor:pointer;font-size:.85em;color:#fff}
.bs{background:#6b7280}.b1{background:#22c55e}.b2{background:#ef4444}.b3{background:#3b82f6}
.b4{background:#a855f7}.b5{background:#ec4899}.b6{background:#f97316}.b7{background:#14b8a6}
.pol{font-size:.8em;padding:4px 8px;border-radius:4px;display:inline-block;margin:2px}
.pol.al{background:#ef4444;color:#fff}.pol.ah{background:#22c55e;color:#fff}
input[type=text],input[type=password]{width:100%;padding:8px;margin:5px 0;border-radius:6px;border:1px solid #475569;background:#0f172a;color:#e2e8f0}
.btn{padding:10px 20px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;margin-top:8px}
.log{background:#0f172a;padding:10px;border-radius:6px;font-family:monospace;font-size:.8em;max-height:150px;overflow-y:auto;color:#4ade80}
#ts{text-align:center;color:#64748b;font-size:.8em;margin-top:8px}
</style></head><body><div class='c'>
<h1>🏫 Smart Class IoT</h1>

<div class='card'><h2>📊 Sensor Real-time</h2>
<div class='g'>
<div class='sb'><div class='v' id='t'>--</div><div class='l'>🌡️ Suhu °C</div></div>
<div class='sb'><div class='v' id='h'>--</div><div class='l'>💧 Kelembaban %</div></div>
<div class='sb'><div class='v' id='d'>--</div><div class='l'>📏 Jarak cm</div></div>
<div class='sb'><div class='v' id='l'>--</div><div class='l'>☀️ Cahaya</div></div>
<div class='sb' id='gb'><div class='v' id='g'>--</div><div class='l'>💨 Gas MQ2</div></div>
<div class='sb' id='fb'><div class='v' id='f'>--</div><div class='l'>🔥 Api</div></div>
<div class='sb'><div class='v' id='s'>--</div><div class='l'>🔊 Suara</div></div>
</div><div id='ts'>Belum ada data</div></div>

<div class='card'><h2>🔬 DO Polarity (Auto-Detect)</h2>
<div class='g'>
<div class='sb'><div class='l'>MQ2</div><span class='pol' id='pm'>?</span></div>
<div class='sb'><div class='l'>Flame</div><span class='pol' id='pf'>?</span></div>
<div class='sb'><div class='l'>LDR</div><span class='pol' id='pl'>?</span></div>
</div></div>

<div class='card'><h2>🎵 Buzzer & Musik</h2>
<div class='bg'>
<button class='bs' onclick='cmd("PLAY:0")'>⏹ Stop</button>
<button class='b1' onclick='cmd("PLAY:1")'>🎵 Startup</button>
<button class='b2' onclick='cmd("PLAY:2")'>🚨 Alarm</button>
<button class='b3' onclick='cmd("PLAY:3")'>🔔 Bell</button>
<button class='b4' onclick='cmd("PLAY:4")'>📱 Nokia</button>
<button class='b5' onclick='cmd("PLAY:5")'>🎂 Birthday</button>
<button class='b6' onclick='cmd("PLAY:6")'>🍄 Mario</button>
<button class='b7' onclick='cmd("PLAY:7")'>⭐ Twinkle</button>
<button class='b2' onclick='cmd("PLAY:8")'>🔊 Buzzer ON</button>
<button class='bs' onclick='cmd("PLAY:9")'>🔇 Buzzer OFF</button>
</div></div>

<div class='card'><h2>🔧 Kontrol</h2>
<div class='bg'>
<button class='b3' onclick='cmd("CALIBRATE")'>🔧 Kalibrasi</button>
<button class='b6' onclick='location.href="/wifi"'>📶 WiFi Setting</button>
<button class='b4' onclick='location.href="/ota"'>📦 OTA Update</button>
</div></div>

<div class='card'><h2>🎹 Piano (Low Latency)</h2>
<div class='bg' style='display:flex;gap:5px;flex-wrap:wrap;justify-content:center'>
<button class='b1' onclick='cmd("NOTE:262:200")'>C4</button>
<button class='b1' onclick='cmd("NOTE:294:200")'>D4</button>
<button class='b1' onclick='cmd("NOTE:330:200")'>E4</button>
<button class='b1' onclick='cmd("NOTE:349:200")'>F4</button>
<button class='b1' onclick='cmd("NOTE:392:200")'>G4</button>
<button class='b1' onclick='cmd("NOTE:440:200")'>A4</button>
<button class='b1' onclick='cmd("NOTE:494:200")'>B4</button>
<button class='b1' onclick='cmd("NOTE:523:200")'>C5</button>
<button class='b1' onclick='cmd("NOTE:587:200")'>D5</button>
<button class='b1' onclick='cmd("NOTE:659:200")'>E5</button>
</div><div style='text-align:center;font-size:0.8em;color:#aaa'>Respon tombol ini lebih cepat daripada web Google Script</div></div>

<div class='card'><h2>📡 Device Info</h2>
<div class='g'>
<div class='sb'><div class='v' id='rssi'>--</div><div class='l'>📶 WiFi dBm</div></div>
<div class='sb'><div class='v' id='up'>--</div><div class='l'>⏱ Uptime</div></div>
<div class='sb'><div class='v' id='hp'>--</div><div class='l'>💾 Free Heap</div></div>
<div class='sb'><div class='v' id='ip'>--</div><div class='l'>🌐 IP Address</div></div>
</div></div>

<div class='card'><h2>📋 Log</h2><div class='log' id='log'>[System] Ready...</div></div>
</div>
<script>
function lg(m){document.getElementById('log').innerHTML='['+new Date().toLocaleTimeString()+'] '+m+'<br>'+document.getElementById('log').innerHTML;}
function pol(v){return v==0?'<span class="pol al">0=Bahaya (AL)</span>':'<span class="pol ah">1=Bahaya (AH)</span>';}
async function cmd(c){try{let r=await fetch('/api/command?cmd='+c);lg('CMD: '+c);}catch(e){lg('ERR: '+e);}}
async function refresh(){
  try{
    let r=await fetch('/api/sensors');let d=await r.json();
    document.getElementById('t').textContent=d.t+'°C';
    document.getElementById('h').textContent=d.h+'%';
    document.getElementById('d').textContent=d.d+'cm';
    document.getElementById('l').textContent=d.l;
    document.getElementById('g').textContent=d.g;
    let fDanger=(d.pol_flame==0&&d.f==0)||(d.pol_flame==1&&d.f==1);
    document.getElementById('f').textContent=fDanger?'⚠️BAHAYA!':'✅Aman';
    document.getElementById('fb').className='sb'+(fDanger?' danger':'');
    document.getElementById('fb').className='sb'+(fDanger?' danger':'');
    document.getElementById('gb').className='sb'+(d.g>800?' warn':'');
    document.getElementById('rssi').textContent=d.rssi;
    let u=d.uptime;document.getElementById('up').textContent=Math.floor(u/3600)+'j '+Math.floor((u%3600)/60)+'m';
    document.getElementById('hp').textContent=Math.round(d.heap/1024)+'KB';
    document.getElementById('ip').textContent=d.ip;
    document.getElementById('pm').innerHTML=pol(d.pol_mq2);
    document.getElementById('pf').innerHTML=pol(d.pol_flame);
    document.getElementById('ps').innerHTML=pol(d.pol_sound);
    document.getElementById('pl').innerHTML=pol(d.pol_ldr);
    document.getElementById('ts').textContent='Updated: '+new Date().toLocaleTimeString();
    lg('Data refreshed');
  }catch(e){lg('ERR: '+e);}
}
setInterval(refresh,5000);refresh();
</script></body></html>
)rawhtml";

#endif
