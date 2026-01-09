const { sendEmail } = require('../utils/sendEmail');
const User = require('../models/User');

// @desc    Send contact US message
// @route   POST /api/contact
// @access  Public
const sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        // Find all managers with full access
        const managers = await User.find({
            role: 'manager',
            'permissions.fullAccess': true
        }).select('email');

        const managerEmails = managers.map(user => user.email);

        // Fallback email if no managers found (optional but good for safety)
        if (managerEmails.length === 0) {
            managerEmails.push('liyakhatyusufraza274@gmail.com');
        }

        // Remove duplicates and join
        const recipientList = [...new Set(managerEmails)].join(', ');

        const emailContent = `
            <h3>New Contact Message</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        // Send email to all managers
        if (recipientList) {
            await sendEmail(recipientList, `New Contact: ${subject}`, emailContent);
        }

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

module.exports = { sendContactMessage };
