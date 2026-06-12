const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['fall_detected', 'inactivity_detected', 'impact_detected'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // The sensor reading that triggered the alarm
    triggerData: {
      accelerometerMagnitude: Number,
      gyroscopeX: Number,
      gyroscopeY: Number,
      gyroscopeZ: Number,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Admin can mark alarm as resolved
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alarm', alarmSchema);
