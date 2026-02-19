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
router.post('/', auth, (req, res, next) => {
    if (req.user.role === 'service_provider' || req.user.role === 'manager') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Service Provider or Manager role required.' });
    }
}, createService);
router.get('/my/all', auth, isServiceProvider, getMyServices);
router.put('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router;
