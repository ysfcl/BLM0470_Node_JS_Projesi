import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { sendSensorData, sendAlarm } from '../services/ApiService';
import { FallDetector } from '../services/FallDetector';

const DEVICE_ID = 'mobile-001';
const SENSOR_INTERVAL_MS = 200;

export function useSensor() {
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 });
  const [magnitude, setMagnitude] = useState(1.0);
  const [alarms, setAlarms] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const accelRef = useRef({ x: 0, y: 0, z: 0 });
  const gyroRef = useRef({ x: 0, y: 0, z: 0 });
  const magnitudeRef = useRef(1.0);
  const detectorRef = useRef(null);
  const subsRef = useRef({ accel: null, gyro: null, interval: null });

  const triggerLocalAlarm = useCallback((type, details) => {
    const backendType = type === 'FALL' ? 'fall_detected' : 'inactivity_detected';

    const alarmForBackend = {
      deviceId: DEVICE_ID,
      type: backendType,
      triggerData: {
        accelerometerMagnitude: magnitudeRef.current,
        gyroscopeX: gyroRef.current.x,
        gyroscopeY: gyroRef.current.y,
        gyroscopeZ: gyroRef.current.z,
      }
    };

    const localAlarm = {
      deviceId: DEVICE_ID,
      type,
      timestamp: new Date().toISOString(),
      details,
    };

    setAlarms((prev) => [localAlarm, ...prev].slice(0, 50));
    sendAlarm(alarmForBackend);
  }, []);

  useEffect(() => {
    detectorRef.current = new FallDetector(
      (ts) => triggerLocalAlarm('FALL', `Düşme tespit edildi: ${ts}`),
      (dur) => triggerLocalAlarm('INACTIVITY', `${Math.round(dur / 1000)}s hareketsizlik`)
    );
  }, [triggerLocalAlarm]);

  const start = useCallback(async () => {
    try {
      const { Accelerometer, Gyroscope } = await import('expo-sensors');

      Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
      Gyroscope.setUpdateInterval(SENSOR_INTERVAL_MS);

      subsRef.current.accel = Accelerometer.addListener((data) => {
        accelRef.current = data;
        setAccel({ ...data });
        const result = detectorRef.current?.process(data);
        if (result) {
          magnitudeRef.current = result.magnitude;
          setMagnitude(result.magnitude);
        }
      });

      subsRef.current.gyro = Gyroscope.addListener((data) => {
        gyroRef.current = data;
        setGyro({ ...data });
      });

      subsRef.current.interval = setInterval(() => {
        sendSensorData({
          deviceId: DEVICE_ID,
          timestamp: new Date().toISOString(),
          accelerometer: accelRef.current,
          gyroscope: gyroRef.current,
        });
      }, 1000);

      detectorRef.current?.reset();
      setIsActive(true);
    } catch (e) {
      console.log('Sensör başlatma hatası:', e.message);
    }
  }, []);

  const stop = useCallback(() => {
    subsRef.current.accel?.remove();
    subsRef.current.gyro?.remove();
    clearInterval(subsRef.current.interval);
    subsRef.current = { accel: null, gyro: null, interval: null };
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      subsRef.current.accel?.remove();
      subsRef.current.gyro?.remove();
      clearInterval(subsRef.current.interval);
    };
  }, []);

  const clearAlarms = () => setAlarms([]);

  return { accel, gyro, magnitude, alarms, isActive, start, stop, clearAlarms };
}