const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, 'Device ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    // Accelerometer data (m/s²)
    accelerometer: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      magnitude: { type: Number }, // calculated: sqrt(x²+y²+z²)
    },
    // Gyroscope data (rad/s)
    gyroscope: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    // Optional: GPS location
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

// Auto-calculate accelerometer magnitude before saving
sensorDataSchema.pre('save', function (next) {
  const { x, y, z } = this.accelerometer;
  this.accelerometer.magnitude = Math.sqrt(x * x + y * y + z * z);
  next();
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
