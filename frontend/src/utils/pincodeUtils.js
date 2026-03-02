/**
 * Pincode Lookup Utility
 * Uses the free India Post API to look up city/village/district/state from a 6-digit pincode.
 * API: https://api.postalpincode.in/pincode/{pincode}
 */

/**
 * Lookup pincode details from the India Post API.
 * @param {string} pincode - A 6-digit Indian pincode
 * @returns {Promise<{success: boolean, data?: {state: string, district: string, postOffices: Array<{name: string, type: string}>}, error?: string}>}
 */
export const lookupPincode = async (pincode) => {
    // Validate pincode format
    if (!pincode || !/^\d{6}$/.test(pincode)) {
        return { success: false, error: 'Please enter a valid 6-digit pincode' };
    }

    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (!data || !data[0]) {
            return { success: false, error: 'Unable to fetch pincode data' };
        }

        const result = data[0];

        if (result.Status === 'Error' || result.Status === '404') {
            return { success: false, error: result.Message || 'Invalid pincode' };
        }

        if (!result.PostOffice || result.PostOffice.length === 0) {
            return { success: false, error: 'No post offices found for this pincode' };
        }

        // Extract unique data
        const postOffices = result.PostOffice.map(po => ({
            name: po.Name,
            type: po.BranchType, // e.g., 'Head Office', 'Sub Office', 'Branch Office'
            deliveryStatus: po.DeliveryStatus,
            division: po.Division,
            region: po.Region,
            block: po.Block,
            taluk: po.Taluk
        }));

        // Use the first post office for state/district (they're all the same for one pincode)
        const firstPO = result.PostOffice[0];

        return {
            success: true,
            data: {
                state: firstPO.State,
                district: firstPO.District,
                country: firstPO.Country,
                block: firstPO.Block,
                division: firstPO.Division,
                postOffices
            }
        };
    } catch (error) {
        console.error('Pincode lookup error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
};
