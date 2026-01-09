const express = require('express');
const router = express.Router();
const {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getMyServices
} = require('../controllers/serviceController');
const { auth, isManager, isServiceProvider } = require('../middleware/auth');

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes
router.post('/', auth, isServiceProvider, createService);
router.get('/my/all', auth, isServiceProvider, getMyServices);
router.put('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router;
