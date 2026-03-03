const express = require('express');
const router = express.Router();
const { getLocationsByDistrict } = require('../controllers/locationController');

router.get('/district/:district', getLocationsByDistrict);

module.exports = router;
