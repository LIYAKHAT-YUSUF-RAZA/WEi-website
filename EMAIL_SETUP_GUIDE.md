# Email Configuration Setup Guide

## Problem
Newly created managers are not receiving account approval/rejection emails.

## Root Causes Fixed
1. ✅ **Email transporter was created at module load** - Now created dynamically per request
2. ✅ **Environment variables not validated** - Added validation with clear error messages
3. ✅ **Silent email failures** - Added comprehensive logging throughout the email flow
4. ✅ **No email configuration test** - Created test script to verify setup

## Setup Instructions

### Step 1: Configure Environment Variables

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create a `.env` file** (if it doesn't exist):
   ```bash
   copy .env.example .env
   ```

3. **Edit the `.env` file** and configure these critical variables:

   ```env
   # Email Configuration
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_16_char_app_password
   
   # Frontend URLs
   FRONTEND_URL=http://localhost:5173
   CLIENT_URL=http://localhost:5173
   ```

### Step 2: Set Up Gmail App Password

**IMPORTANT:** You cannot use your regular Gmail password. You must create an App Password.

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or Other)
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
   - Use this password in your `.env` file as `EMAIL_PASS` (remove spaces)

### Step 3: Test Email Configuration

Run the test script to verify everything is working:

```bash
node testEmail.js
```

**Expected Output:**
```
=====================================
EMAIL CONFIGURATION TEST
=====================================

1️⃣ Checking environment variables...
   EMAIL_USER: ✅ your_gmail@gmail.com
   EMAIL_PASS: ✅ Set (length: 16)
   FRONTEND_URL: ✅ http://localhost:5173

2️⃣ Creating email transporter...
✅ Transporter created

3️⃣ Verifying SMTP connection...
✅ SMTP Connection successful!

4️⃣ Sending test email...
✅ Test email sent successfully!
   Message ID: <...>
   Response: 250 2.0.0 OK ...

🎉 Email configuration is working perfectly!
   Check your inbox at: your_gmail@gmail.com
```

### Step 4: Restart Your Server

After configuring the `.env` file, restart your backend server:

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm start
```

## Verification

### When a Manager Approves a New Manager Request:

**In the terminal/console, you should see:**
```
👤 New manager account created: newmanager@example.com
📧 Sending approval email...
📧 Creating email transporter with user: your_gmail@gmail.com
✅ Transporter created successfully
✅ Manager approval email sent successfully to newmanager@example.com
✅ Email service response: { success: true, message: 'Email sent successfully' }
```

**The new manager should receive an email with:**
- ✅ Welcome message
- ✅ Their assigned permissions
- ✅ Login credentials
- ✅ Login button/link

### If Email Fails:

**You will see detailed error logs:**
```
❌ EMAIL SENDING FAILED: Error: ...
❌ Error stack: ...
❌ Environment check:
   EMAIL_USER: Set
   EMAIL_PASS: Set (length: 16)
```

## Common Issues & Solutions

### Issue 1: "EMAIL_USER or EMAIL_PASS environment variables are not set!"
**Solution:** Create/update your `.env` file with proper credentials

### Issue 2: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** 
- You're using your regular Gmail password instead of App Password
- Generate an App Password at https://myaccount.google.com/apppasswords
- Enable 2-Factor Authentication first

### Issue 3: Emails not sending but no error in logs
**Solution:**
- Run `node testEmail.js` to diagnose the issue
- Check if your `.env` file is in the correct location (backend folder)
- Verify the server was restarted after changing `.env`

### Issue 4: "Missing credentials for PLAIN"
**Solution:** 
- Environment variables not loaded
- Run `node testEmail.js` to verify
- Make sure dotenv is configured in server.js

## Files Modified

1. **backend/utils/emailService.js**
   - Changed transporter to be created dynamically
   - Added environment variable validation
   - Enhanced error logging with detailed error information
   - Added console logs for tracking email flow

2. **backend/controllers/managerRequestController.js**
   - Enhanced error logging
   - Added environment variable checks
   - Better error messages for debugging

3. **backend/.env.example** (NEW)
   - Template for environment variables
   - Includes setup instructions

4. **backend/testEmail.js** (NEW)
   - Email configuration test script
   - Diagnoses common issues

## Support

If you still face issues after following this guide:
1. Run `node testEmail.js` and share the output
2. Check the server console logs when approving a manager request
3. Verify your Gmail App Password is correctly generated and copied
