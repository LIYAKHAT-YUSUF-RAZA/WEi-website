const nodemailer = require('nodemailer');

// Create transporter dynamically to ensure env vars are loaded
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS environment variables are not set!');
    throw new Error('Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }
  
  console.log('📧 Creating email transporter with user:', process.env.EMAIL_USER);
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send enrollment request email to manager
exports.sendEnrollmentRequestToManager = async (managerEmail, candidateName, candidateEmail, courseName, enrollmentId) => {
  const transporter = createTransporter();
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
  const transporter = createTransporter();
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
  const transporter = createTransporter();
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
  const transporter = createTransporter();
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
  const transporter = createTransporter();
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
  const transporter = createTransporter();
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
  const transporter = createTransporter();
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

// Send manager account approval email
exports.sendManagerAccountApprovalEmail = async (managerEmail, managerName, permissions) => {
  console.log('🚀 Attempting to send manager approval email to:', managerEmail);
  
  try {
    const transporter = createTransporter();
    console.log('✅ Transporter created successfully');
    
    const mailOptions = {
    from: process.env.EMAIL_USER,
    to: managerEmail,
    subject: '🎉 Manager Account Approved - WEintegrity Technologies',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">✅ Welcome to WEintegrity!</h2>
        <p>Dear ${managerName},</p>
        <p>Congratulations! Your manager account request has been approved. You can now login to the system and start managing operations.</p>
        
        <div style="background-color: #D1FAE5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Access Permissions:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            ${permissions?.fullAccess ? '<li style="margin: 8px 0;"><strong>✓ Full Access</strong> - Complete system control</li>' : ''}
            ${permissions?.canManageCourses ? '<li style="margin: 8px 0;">✓ Manage Courses</li>' : ''}
            ${permissions?.canManageInternships ? '<li style="margin: 8px 0;">✓ Manage Internships</li>' : ''}
            ${permissions?.canApproveApplications ? '<li style="margin: 8px 0;">✓ Approve Applications</li>' : ''}
            ${permissions?.canRejectApplications ? '<li style="margin: 8px 0;">✓ Reject Applications</li>' : ''}
            ${permissions?.canViewAllApplications ? '<li style="margin: 8px 0;">✓ View All Applications</li>' : ''}
            ${permissions?.canManageNotifications ? '<li style="margin: 8px 0;">✓ Manage Notifications</li>' : ''}
          </ul>
        </div>
        
        <div style="background-color: #EEF2FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Login Credentials:</h3>
          <p><strong>Email:</strong> ${managerEmail}</p>
          <p><strong>Password:</strong> Use the password you set during registration</p>
        </div>
        
        <p>Click the button below to login to your manager dashboard:</p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background-color: #4F46E5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Login to Dashboard
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
        <p style="color: #6B7280; font-size: 14px;">
          If you have any questions, please contact support at ${process.env.EMAIL_USER}
        </p>
      </div>
    `
  };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Manager approval email sent successfully to ${managerEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send manager approval email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    throw new Error(`Failed to send approval email: ${error.message}`);
  }
};

// Send manager account rejection email
exports.sendManagerAccountRejectionEmail = async (managerEmail, managerName) => {
  console.log('🚀 Attempting to send manager rejection email to:', managerEmail);
  
  try {
    const transporter = createTransporter();
    const mailOptions = {
    from: process.env.EMAIL_USER,
    to: managerEmail,
    subject: 'Manager Account Request - Status Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Account Request Status Update</h2>
        <p>Dear ${managerName},</p>
        <p>Thank you for your interest in becoming a manager at WEintegrity Technologies.</p>
        
        <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: #EF4444; font-weight: bold;">Request Not Approved</span></p>
        </div>
        
        <p>We regret to inform you that your manager account request has not been approved at this time.</p>
        
        <p>If you believe this is an error or would like to discuss this decision, please contact our administrator team.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/contact" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Contact Support
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Manager rejection email sent successfully to ${managerEmail}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Failed to send manager rejection email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    throw new Error(`Failed to send rejection email: ${error.message}`);
  }
};

// Send notification to existing managers about new manager request
exports.sendNewManagerRequestNotification = async (existingManagerEmail, requestDetails) => {
  console.log('🔔 Sending new manager request notification to:', existingManagerEmail);
  
  try {
    const transporter = createTransporter();
    const mailOptions = {
    from: process.env.EMAIL_USER,
    to: existingManagerEmail,
    subject: '🔔 New Manager Account Request - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">New Manager Account Request</h2>
        <p>Hello,</p>
        <p>A new manager account request has been submitted and requires your review:</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Applicant Details:</h3>
          <p><strong>Name:</strong> ${requestDetails.name}</p>
          <p><strong>Email:</strong> ${requestDetails.email}</p>
          <p><strong>Phone:</strong> ${requestDetails.phone || 'Not provided'}</p>
          <p><strong>Status:</strong> <span style="color: #F59E0B; font-weight: bold;">Pending Review</span></p>
        </div>
        
        <p>Please review this request and approve or reject it from your manager dashboard.</p>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/manager/requests" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review Request
          </a>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #6B7280; font-size: 14px;">
          This is an automated email from WEintegrity Technologies. Please do not reply to this email.
        </p>
      </div>
    `
  };

    await transporter.sendMail(mailOptions);
    console.log(`✅ New manager request notification sent to ${existingManagerEmail}`);
  } catch (error) {
    console.error('❌ Failed to send new manager request notification:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code
    });
    // Don't throw error for notification emails - log but continue
  }
};

// Send course request notification to managers
exports.sendCourseRequestNotification = async (managerEmail, managerName, candidateName, candidateEmail, courseName) => {
  const transporter = createTransporter();
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: managerEmail,
      subject: `New Course Enrollment Request - ${courseName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">📚 New Course Enrollment Request</h2>
          <p>Hello ${managerName},</p>
          <p>You have received a new course enrollment request:</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Candidate Details:</h3>
            <p><strong>Name:</strong> ${candidateName}</p>
            <p><strong>Email:</strong> ${candidateEmail}</p>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Status:</strong> <span style="color: #F59E0B; font-weight: bold;">⏳ Pending Review</span></p>
          </div>
          
          <p>Please review this course enrollment request and approve or reject it. The candidate will be notified of your decision.</p>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/manager/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Requests
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this address.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Course request notification sent to:', managerEmail);
  } catch (error) {
    console.error('❌ Failed to send course request notification:', error);
    // Don't throw error for notification emails - log but continue
  }
};

// Send course request decision (approval/rejection) to candidate
exports.sendCourseRequestDecision = async (candidateEmail, candidateName, courseName, decision, message) => {
  const transporter = createTransporter();
  
  const isApproved = decision === 'approved';
  const title = isApproved ? '✅ Course Enrollment Approved' : '❌ Course Enrollment Request Rejected';
  const statusColor = isApproved ? '#10B981' : '#EF4444';
  const statusText = isApproved ? 'APPROVED' : 'REJECTED';
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColor};">${title}</h2>
          <p>Hello ${candidateName},</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
            ${message ? `<p><strong>Message from Manager:</strong> ${message}</p>` : ''}
          </div>
          
          ${isApproved ? `
            <p>Congratulations! Your course enrollment request has been approved. You can now proceed to enroll in the course.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/candidate/dashboard" 
                 style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
          ` : `
            <p>Unfortunately, your course enrollment request for <strong>${courseName}</strong> has been rejected.</p>
            ${message ? `<p>Reason: ${message}</p>` : ''}
            <p>If you have any questions, please contact the support team.</p>
          `}
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply to this address.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Course request ${decision} email sent to:`, candidateEmail);
  } catch (error) {
    console.error(`❌ Failed to send course request ${decision} email:`, error);
    // Don't throw error for notification emails - log but continue
  }
};
