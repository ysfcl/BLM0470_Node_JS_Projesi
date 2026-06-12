// ────────────────────────────────────────────
//  ApiService.js
// ────────────────────────────────────────────

const BASE_URL = 'https://colonial-lying-deck.ngrok-free.dev';

let _token = null;
export const setToken = (t) => { _token = t; };

async function request(method, path, body) {
  const headers = { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
};
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Sunucu hatası');
    return data;
  } catch (err) {
    // Backend henüz bağlı değilse konsola yaz, uygulamayı patlatma
    console.log(`[API] ${method} ${path}`, body ?? '', '→', err.message);
    return { stub: true };
  }
}

// ── Auth ──────────────────────────────────────

export const register = (name, email, password) =>
  request('POST', '/api/auth/register', { name, email, password });


export const login = (email, password) =>
  request('POST', '/api/auth/login', { email, password });


export const getMe = () =>
  request('GET', '/api/auth/me');

// ── Sensör verisi ─────────────────────────────

export const sendSensorData = (payload) =>
  request('POST', '/api/sensors/data', payload);

// ── Alarm gönder ──────────────────────────────
export const sendAlarm = (alarm) =>
  request('POST', '/api/sensors/alarms', alarm);



export const getSensorData = () =>
  request('GET', '/api/sensors/data');

// ── Alarmlar ──────────────────────────────────

export const getAlarms = () =>
  request('GET', '/api/sensors/alarms');


export const resolveAlarm = (id) =>
  request('PATCH', `/api/sensors/alarms/${id}/resolve`);
