const express = require('express');
const router = express.Router();
const { getCompanyInfo, updateCompanyInfo } = require('../controllers/companyController');
const { auth, isManager } = require('../middleware/auth');

router.get('/', getCompanyInfo);
router.put('/', auth, isManager, updateCompanyInfo);

module.exports = router;
