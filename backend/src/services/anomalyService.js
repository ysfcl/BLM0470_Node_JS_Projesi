const SensorData = require('../models/SensorData');
const Alarm = require('../models/Alarm');

// ─── Thresholds ───────────────────────────────────────────────────────────────
// These values can be tuned based on real-world testing.

// Fall detection: a sudden spike in acceleration magnitude followed by near-zero
const FALL_IMPACT_THRESHOLD = 25;    // m/s² — free-fall impact spike
const FALL_POST_IMPACT_THRESHOLD = 5; // m/s² — still/flat after impact

// Inactivity: no significant movement for this many minutes
const INACTIVITY_MINUTES = 5;
const INACTIVITY_MOVEMENT_THRESHOLD = 1.5; // m/s² — anything below = no movement

// ─── Fall Detection ───────────────────────────────────────────────────────────
/**
 * Checks if the current reading indicates a fall.
 * Logic: magnitude spike (impact) + previous readings show sudden drop (free-fall phase).
 */
const detectFall = async (currentReading, io) => {
  const { deviceId, userId, accelerometer, gyroscope } = currentReading;
  const magnitude = accelerometer.magnitude;

  // Step 1: Is there a high-impact spike?
  if (magnitude < FALL_IMPACT_THRESHOLD) return null;

  // Step 2: Check the last 2 seconds of readings for a free-fall phase (low magnitude before spike)
  const twoSecondsAgo = new Date(currentReading.timestamp - 2000);
  const recentReadings = await SensorData.find({
    deviceId,
    timestamp: { $gte: twoSecondsAgo, $lt: currentReading.timestamp },
  }).sort({ timestamp: 1 });

  const hadFreeFall = recentReadings.some(
    (r) => r.accelerometer.magnitude < FALL_POST_IMPACT_THRESHOLD
  );

  if (!hadFreeFall) return null;

  // Prevent duplicate alarms: don't create if there's already a fall alarm in the last 10 seconds
  const tenSecondsAgo = new Date(currentReading.timestamp - 10000);
  const recentAlarm = await Alarm.findOne({
    deviceId,
    type: 'fall_detected',
    detectedAt: { $gte: tenSecondsAgo },
  });
  if (recentAlarm) return null;

  const alarm = await Alarm.create({
    deviceId,
    userId,
    type: 'fall_detected',
    severity: 'high',
    triggerData: {
      accelerometerMagnitude: magnitude,
      gyroscopeX: gyroscope.x,
      gyroscopeY: gyroscope.y,
      gyroscopeZ: gyroscope.z,
    },
    detectedAt: currentReading.timestamp,
  });

  // Emit real-time alarm via Socket.io
  if (io) {
    io.emit('new_alarm', alarm);
  }

  console.log(`[ALARM] Fall detected on device ${deviceId}`);
  return alarm;
};

// ─── Inactivity Detection ─────────────────────────────────────────────────────
/**
 * Checks if the device has been inactive for INACTIVITY_MINUTES.
 * Called periodically (see app.js interval), not on every sensor reading.
 */
const detectInactivity = async (io) => {
  const cutoff = new Date(Date.now() - INACTIVITY_MINUTES * 60 * 1000);

  // Get all unique devices that have sent data
  const activeDevices = await SensorData.distinct('deviceId');

  for (const deviceId of activeDevices) {
    const latestReading = await SensorData.findOne({ deviceId }).sort({ timestamp: -1 });
    if (!latestReading) continue;

    // Check if device has been quiet (last reading is old)
    if (latestReading.timestamp > cutoff) continue;

    // Check movement magnitude in the inactivity window
    const readings = await SensorData.find({
      deviceId,
      timestamp: { $gte: cutoff },
    });

    const allInactive = readings.every(
      (r) => r.accelerometer.magnitude < INACTIVITY_MOVEMENT_THRESHOLD
    );

    // If readings exist but all show no movement, or no readings at all
    const isInactive = readings.length === 0 || allInactive;
    if (!isInactive) continue;

    // Prevent duplicate inactivity alarms within the same window
    const recentAlarm = await Alarm.findOne({
      deviceId,
      type: 'inactivity_detected',
      detectedAt: { $gte: cutoff },
    });
    if (recentAlarm) continue;

    const alarm = await Alarm.create({
      deviceId,
      userId: latestReading.userId,
      type: 'inactivity_detected',
      severity: 'medium',
      triggerData: {
        accelerometerMagnitude: latestReading.accelerometer.magnitude,
      },
      detectedAt: new Date(),
    });

    if (io) {
      io.emit('new_alarm', alarm);
    }

    console.log(`[ALARM] Inactivity detected on device ${deviceId}`);
  }
};

module.exports = { detectFall, detectInactivity };
