const express = require('express');
const router = express.Router();
const {
    createRequest,
    getRequests,
    updateRequest
} = require('../controllers/serviceProviderRequestController');
const { auth, isManager } = require('../middleware/auth');

router.post('/', createRequest);
router.get('/', auth, isManager, getRequests);
router.put('/:id', auth, isManager, updateRequest);

module.exports = router;
