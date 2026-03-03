const path = require('path');
const fs = require('fs');

let locationsData = null;

// Read JSON data once into memory
try {
    const dataPath = path.join(__dirname, '..', 'data', 'locations.json');
    if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf8');
        locationsData = JSON.parse(raw);
    }
} catch (error) {
    console.error('Error loading locations data:', error);
}

// @desc    Get villages and pincodes by district
// @route   GET /api/locations/district/:district
// @access  Public
exports.getLocationsByDistrict = (req, res) => {
    try {
        if (!locationsData) {
            return res.status(503).json({ success: false, message: 'Location data is currently unavailable' });
        }

        const { district } = req.params;
        if (!district) {
            return res.status(400).json({ success: false, message: 'District parameter is required' });
        }

        const dKey = district.trim().toLowerCase();
        const locations = locationsData[dKey] || [];

        if (locations.length === 0) {
            // Also try matching by partial string if exact match fails
            let matchedLocations = [];
            for (const key of Object.keys(locationsData)) {
                if (key.includes(dKey) || dKey.includes(key)) {
                    matchedLocations = locationsData[key];
                    break;
                }
            }
            if (matchedLocations.length === 0) {
                return res.status(404).json({ success: false, message: 'No locations found for this district' });
            }
            return res.json({ success: true, count: matchedLocations.length, data: matchedLocations });
        }

        res.json({ success: true, count: locations.length, data: locations });

    } catch (error) {
        console.error('Error fetching locations by district:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
