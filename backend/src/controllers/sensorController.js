const SensorData = require('../models/SensorData');
const Alarm = require('../models/Alarm');
const { detectFall } = require('../services/anomalyService');

// POST /api/sensors/data
// Called by the mobile app to push sensor readings
const receiveSensorData = async (req, res) => {
  try {
    const { deviceId, timestamp, accelerometer, gyroscope, location } = req.body;

    if (!deviceId || !accelerometer || !gyroscope) {
      return res.status(400).json({
        success: false,
        message: 'deviceId, accelerometer and gyroscope are required',
      });
    }

    const { x: ax, y: ay, z: az } = accelerometer;
    const { x: gx, y: gy, z: gz } = gyroscope;

    if ([ax, ay, az, gx, gy, gz].some((v) => v === undefined || v === null)) {
      return res.status(400).json({
        success: false,
        message: 'accelerometer and gyroscope must have x, y, z values',
      });
    }

    const io = req.app.get('io');

    const sensorEntry = await SensorData.create({
      deviceId,
      userId: req.user._id,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      accelerometer: { x: ax, y: ay, z: az },
      gyroscope: { x: gx, y: gy, z: gz },
      location: location || {},
    });

    // Emit real-time data to frontend dashboard
    io.emit('sensor_data', {
      deviceId,
      timestamp: sensorEntry.timestamp,
      accelerometer: sensorEntry.accelerometer,
      gyroscope: sensorEntry.gyroscope,
    });

    // Run fall detection on this reading
    const alarm = await detectFall(sensorEntry, io);

    res.status(201).json({
      success: true,
      data: sensorEntry,
      alarm: alarm || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sensors/data?deviceId=xxx&limit=100
const getSensorData = async (req, res) => {
  try {
    const { deviceId, limit = 100, from, to } = req.query;

    const filter = {};

    // Regular users can only see their own device's data
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    if (deviceId) filter.deviceId = deviceId;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const data = await SensorData.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/sensors/alarms - Mobil app alarm gönder
const receiveAlarm = async (req, res) => {
  try {
    const { deviceId, type, timestamp, details } = req.body;

    if (!deviceId || !type) {
      return res.status(400).json({
        success: false,
        message: 'deviceId and type are required',
      });
    }

    // Frontend'e uygun type kullan (FALL, INACTIVITY, IMPACT)
    let alarmType = type;
    let severity = 'medium';
    if (type === 'FALL') severity = 'high';

    const io = req.app.get('io');

    const alarm = await Alarm.create({
      deviceId,
      userId: req.user._id,
      type: alarmType,
      severity,
      detectedAt: timestamp ? new Date(timestamp) : new Date(),
      triggerData: details || {},
    });

    // Emit real-time alarm to frontend dashboard
    io.emit('alarm_triggered', {
      _id: alarm._id,
      deviceId,
      type: alarmType,
      timestamp: alarm.detectedAt,
      details,
    });

    res.status(201).json({
      success: true,
      data: alarm,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sensors/alarms
const getAlarms = async (req, res) => {
  try {
    const { deviceId, resolved, limit = 50 } = req.query;

    const filter = {};

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    if (deviceId) filter.deviceId = deviceId;
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const alarms = await Alarm.find(filter)
      .sort({ detectedAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'name email')
      .select('-__v');

    res.json({ success: true, count: alarms.length, data: alarms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/sensors/alarms/:id/resolve  (admin only)
const resolveAlarm = async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id);
    if (!alarm) {
      return res.status(404).json({ success: false, message: 'Alarm not found' });
    }

    alarm.resolved = true;
    alarm.resolvedAt = new Date();
    alarm.resolvedBy = req.user._id;
    alarm.notes = req.body.notes || '';
    await alarm.save();

    res.json({ success: true, data: alarm });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { receiveSensorData, getSensorData, receiveAlarm, getAlarms, resolveAlarm };
