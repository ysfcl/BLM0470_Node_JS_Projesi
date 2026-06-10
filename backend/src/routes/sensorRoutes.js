const express = require('express');
const router = express.Router();
const {
  receiveSensorData,
  getSensorData,
  getAlarms,
  resolveAlarm,
} = require('../controllers/sensorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/data', receiveSensorData);
router.get('/data', getSensorData);
router.get('/alarms', getAlarms);
router.patch('/alarms/:id/resolve', authorize('admin'), resolveAlarm);

module.exports = router;