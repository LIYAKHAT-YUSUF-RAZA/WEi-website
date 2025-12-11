const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send enrollment request email to manager
exports.sendEnrollmentRequestToManager = async (managerEmail, candidateName, candidateEmail, courseName, enrollmentId) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: managerEmail,
    subject: `New Course Enrollment Request - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Course Enrollment Request</h2>
        <p>Hello,</p>
        <p>You have received a new course enrollment request:</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Candidate Details:</h3>
          <p><strong>Name:</strong> ${candidateName}</p>
          <p><strong>Email:</strong> ${candidateEmail}</p>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Status:</strong> <span style="color: #F59E0B;">Pending Review</span></p>
        </div>
        
        <p>Please review the enrollment request and accept or reject it. The candidate will be asked to pay only after you accept their request.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/manager/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};

// Send enrollment confirmation email to candidate
exports.sendEnrollmentConfirmationToCandidate = async (candidateEmail, candidateName, courseName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Enrollment Request Submitted - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Enrollment Request Received</h2>
        <p>Hello ${candidateName},</p>
        <p>Your enrollment request has been successfully submitted!</p>
        
        <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Course Details:</h3>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Status:</strong> <span style="color: #F59E0B;">Waiting for Manager Approval</span></p>
        </div>
        
        <p>Your enrollment request is currently under review by our team. You will receive an email notification once the manager reviews your request.</p>
        
        <p>You can unenroll from this course anytime before the manager accepts or rejects your request.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/candidate/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View My Enrollments
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};

// Send enrollment decision email to candidate
exports.sendEnrollmentDecisionToCandidate = async (candidateEmail, candidateName, courseName, status, message = '') => {
  const statusColor = status === 'payment_pending' ? '#3B82F6' : status === 'accepted' ? '#10B981' : status === 'unenrolled' ? '#F59E0B' : '#EF4444';
  const statusText = status === 'payment_pending' ? 'Approved - Payment Required' : status === 'accepted' ? 'Accepted' : status === 'unenrolled' ? 'Unenrolled' : 'Rejected';
  const statusIcon = status === 'payment_pending' ? '💳' : status === 'accepted' ? '✅' : status === 'unenrolled' ? '⚠️' : '❌';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Enrollment ${statusText} - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">${statusIcon} Enrollment ${statusText}</h2>
        <p>Hello ${candidateName},</p>
        <p>${status === 'payment_pending' ? 'Great news! Your enrollment request has been approved by the manager.' : status === 'unenrolled' ? 'Your enrollment has been revoked by the manager.' : 'Your enrollment request has been reviewed by the manager.'}</p>
        
        <div style="background-color: ${status === 'payment_pending' ? '#DBEAFE' : status === 'accepted' ? '#D1FAE5' : status === 'unenrolled' ? '#FEF3C7' : '#FEE2E2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Course Details:</h3>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
          ${message ? `<p><strong>Manager's Message:</strong> ${message}</p>` : ''}
        </div>
        
        ${status === 'payment_pending'
          ? `<p><strong>Next Step: Complete Payment</strong></p>
             <p>To confirm your enrollment, please complete the payment for this course. Visit your dashboard and click the "Pay Now" button to proceed with payment.</p>
             <div style="margin: 30px 0;">
               <a href="${process.env.FRONTEND_URL}/dashboard" 
                  style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 Pay Now
               </a>
             </div>`
          : status === 'accepted' 
          ? `<p>Congratulations! You have been successfully enrolled in the course. You can now access the course materials and start learning.</p>
             <div style="margin: 30px 0;">
               <a href="${process.env.FRONTEND_URL}/courses" 
                  style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 Access Course
               </a>
             </div>`
          : status === 'unenrolled'
          ? `<p>You have been unenrolled from this course. ${message ? 'Please review the manager\'s message above.' : 'If you believe this is a mistake, please contact support.'}</p>
             <div style="margin: 30px 0;">
               <a href="${process.env.FRONTEND_URL}/courses" 
                  style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 Browse Other Courses
               </a>
             </div>`
          : `<p>Unfortunately, your enrollment request was not approved at this time. ${message ? 'Please review the manager\'s message above.' : 'You can apply for other courses or contact support for more information.'}</p>
             <div style="margin: 30px 0;">
               <a href="${process.env.FRONTEND_URL}/courses" 
                  style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 Browse Other Courses
               </a>
             </div>`
        }
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};

// Send payment confirmation email to candidate
exports.sendPaymentConfirmationToCandidate = async (candidateEmail, candidateName, courseName, amount, transactionId) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Payment Confirmed - ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">✅ Payment Confirmed!</h2>
        <p>Hello ${candidateName},</p>
        <p>Your payment has been successfully received and verified. Your enrollment is now confirmed!</p>
        
        <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p><strong>Course:</strong> ${courseName}</p>
          <p><strong>Amount Paid:</strong> ₹${amount}</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Status:</strong> <span style="color: #10B981; font-weight: bold;">Confirmed</span></p>
        </div>
        
        <p>You can now access the course materials and start your learning journey!</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};

// Send internship application request email to manager
exports.sendInternshipApplicationToManager = async (managerEmail, candidateName, candidateEmail, internshipTitle, applicationId) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: managerEmail,
    subject: `New Internship Application - ${internshipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Internship Application</h2>
        <p>Hello,</p>
        <p>You have received a new internship application:</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Candidate Details:</h3>
          <p><strong>Name:</strong> ${candidateName}</p>
          <p><strong>Email:</strong> ${candidateEmail}</p>
          <p><strong>Internship:</strong> ${internshipTitle}</p>
          <p><strong>Status:</strong> <span style="color: #F59E0B;">Pending Review</span></p>
        </div>
        
        <p>Please review the application and accept or reject it.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/manager/applications" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Applications
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};

// Send internship application confirmation email to candidate
exports.sendInternshipApplicationConfirmationToCandidate = async (candidateEmail, candidateName, internshipTitle) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Application Submitted - ${internshipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Application Submitted Successfully</h2>
        <p>Hello ${candidateName},</p>
        <p>Your internship application has been successfully submitted!</p>
        
        <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Internship Details:</h3>
          <p><strong>Position:</strong> ${internshipTitle}</p>
          <p><strong>Status:</strong> <span style="color: #F59E0B;">Waiting for Manager Review</span></p>
        </div>
        
        <p>Your application is currently under review by our team. You will receive an email notification once the manager reviews your application.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/application-history" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View My Applications
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};

// Send internship application decision email to candidate
exports.sendInternshipApplicationDecisionToCandidate = async (candidateEmail, candidateName, internshipTitle, status, message = '') => {
  const statusColor = status === 'accepted' ? '#10B981' : '#EF4444';
  const statusText = status === 'accepted' ? 'Accepted' : 'Rejected';
  const statusIcon = status === 'accepted' ? '✅' : '❌';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: candidateEmail,
    subject: `Application ${statusText} - ${internshipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">${statusIcon} Application ${statusText}</h2>
        <p>Hello ${candidateName},</p>
        <p>Your internship application has been reviewed by the manager.</p>
        
        <div style="background-color: ${status === 'accepted' ? '#D1FAE5' : '#FEE2E2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Internship Details:</h3>
          <p><strong>Position:</strong> ${internshipTitle}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
          ${message ? `<p><strong>Manager's Message:</strong> ${message}</p>` : ''}
        </div>
        
        ${status === 'accepted' 
          ? `<p>🎉 Congratulations! You have been selected for the internship. The team will contact you shortly with further details about the next steps.</p>
             <div style="margin: 30px 0;">
               <a href="${process.env.FRONTEND_URL}/application-history" 
                  style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 View Application
               </a>
             </div>`
          : `<p>Unfortunately, your application was not approved at this time. ${message ? 'Please review the manager\'s message above.' : 'We encourage you to apply for other internship opportunities or contact us for feedback.'}</p>
             <div style="margin: 30px 0;">
               <a href="${process.env.FRONTEND_URL}/internships" 
                  style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                 Browse Other Internships
               </a>
             </div>`
        }
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Email error - monitoring handled elsewhere
  }
};
