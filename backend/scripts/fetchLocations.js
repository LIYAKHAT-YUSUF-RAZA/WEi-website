const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_URL = 'https://raw.githubusercontent.com/deep5050/indian-pincodes-database/master/data.json';
const OUTPUT_FILE = path.join(__dirname, 'data', 'locations.json');

console.log('Fetching Indian Pincodes Dataset...');

https.get(DATA_URL, (res) => {
    let rawData = '';

    res.on('data', (chunk) => {
        rawData += chunk;
    });

    res.on('end', () => {
        try {
            // Remove Byte Order Mark (BOM) if present
            if (rawData.charCodeAt(0) === 0xFEFF) {
                rawData = rawData.slice(1);
            }

            console.log('Parsing JSON...');
            const parsedData = JSON.parse(rawData);
            const records = parsedData.Sheet1 || parsedData;

            console.log(`Successfully parsed ${records.length} records.`);

            // Group by district
            // Output format: { "West Godavari": [{name: "Village A", pincode: "534123"}], ... }
            const districtsMap = {};

            records.forEach(record => {
                const district = record.District ? record.District.trim() : null;
                const village = record.PostOfficeName ? record.PostOfficeName.trim() : null;
                const pincode = record.Pincode ? record.Pincode.toString().trim() : null;

                if (district && village && pincode) {
                    const dKey = district.toLowerCase();
                    if (!districtsMap[dKey]) {
                        districtsMap[dKey] = new Map(); // using Map to ensure unique Village+Pincode
                    }

                    const locKey = `${village.toLowerCase()}-${pincode}`;
                    if (!districtsMap[dKey].has(locKey)) {
                        districtsMap[dKey].set(locKey, { name: village, pincode });
                    }
                }
            });

            // Convert Maps back to arrays and sort
            const finalData = {};
            for (const [dKey, locationsMap] of Object.entries(districtsMap)) {
                finalData[dKey] = Array.from(locationsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
            }

            // Create data directory if not exists
            if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
                fs.mkdirSync(path.dirname(OUTPUT_FILE));
            }

            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));

            console.log(`Data successfully written to ${OUTPUT_FILE}`);
            console.log(`Processed ${Object.keys(finalData).length} unique districts.`);

        } catch (error) {
            console.error('Error parsing or writing data:', error.message);
        }
    });

}).on('error', (e) => {
    console.error(`Error requesting data: ${e.message}`);
});
