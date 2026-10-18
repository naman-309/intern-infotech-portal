const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (config.smtp.user && config.smtp.pass) {
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
    } else {
      // Mock / fallback transporter in dev when credentials are empty
      transporter = {
        sendMail: async (options) => {
          console.log('\n--- [MOCK EMAIL SERVICE] Email dispatched ---');
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`HTML Preview (first 250 chars):\n${options.html.substring(0, 250)}...`);
          console.log('----------------------------------------------\n');
          return { messageId: `mock-${Date.now()}` };
        },
      };
    }
  }
  return transporter;
};

const baseTemplate = (title, contentHtml) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; color: #e0e7ff; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    .content { padding: 32px 28px; line-height: 1.6; color: #cbd5e1; font-size: 15px; }
    .btn { display: inline-block; padding: 12px 28px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; text-align: center; }
    .footer { padding: 20px; text-align: center; background-color: #0f172a; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
    .alert-box { background-color: #0284c7; background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38bdf8; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 10px; background-color: #334155; border-radius: 20px; font-size: 12px; color: #94a3b8; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Intern Infotech Academy</h1>
      <p>Software Engineering Institute</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Intern Infotech Institute of Software Engineering. All rights reserved.</p>
      <p>Offline Tech Campus: 402 Tech Hub, IT Corridor, Electronic City</p>
    </div>
  </div>
</body>
</html>
  `;
};

const sendVerificationEmail = async ({ to, fullName, verificationUrl }) => {
  const mailer = getTransporter();
  const html = baseTemplate(
    'Verify Your Email Address',
    `
    <h2>Hello, ${fullName}!</h2>
    <p>Thank you for submitting your admission registration request with the <strong>Intern Infotech Engineering Academy</strong>.</p>
    <p>To confirm that you have access to this email address and allow our academic admissions committee to review your offline registration, please verify your email by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    </div>
    <div class="alert-box">
      <strong>Note:</strong> This verification link will expire in 24 hours. Verifying your email confirms ownership; your account will become active once an administrator or assigned teacher approves your offline admission enrollment.
    </div>
    <p>If you did not request admission, please disregard this email.</p>
    `
  );

  return mailer.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
    to,
    subject: 'Action Required: Verify your email — Intern Infotech Academy',
    html,
  });
};

const sendApprovalEmail = async ({ to, fullName, role, loginUrl }) => {
  const mailer = getTransporter();
  const html = baseTemplate(
    'Registration Approved',
    `
    <h2>Congratulations, ${fullName}!</h2>
    <p>We are pleased to inform you that your registration request as a <strong>${role}</strong> at <strong>Intern Infotech Engineering Academy</strong> has been officially approved!</p>
    <p>Your portal account is now active. You can log in using your registered email and the password you set during registration.</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="btn">Access Portal Dashboard</a>
    </div>
    <p>Once logged in, you can view your assigned courses, batch details, announcements, and academic performance.</p>
    <p>Welcome to our software engineering community!</p>
    `
  );

  return mailer.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
    to,
    subject: `Welcome to Intern Infotech Academy — Your ${role} Account is Approved`,
    html,
  });
};

const sendRejectionEmail = async ({ to, fullName, role, reviewNote }) => {
  const mailer = getTransporter();
  const html = baseTemplate(
    'Registration Status Update',
    `
    <h2>Dear ${fullName},</h2>
    <p>Thank you for your interest in <strong>Intern Infotech Engineering Academy</strong>.</p>
    <p>After reviewing your registration request for the ${role} role against our offline student records, we regret to inform you that your request could not be approved at this time.</p>
    ${reviewNote ? `<div class="alert-box"><strong>Reviewer Note:</strong> ${reviewNote}</div>` : ''}
    <p>If you believe this is in error or if your offline enrollment registration has not yet been processed at our admissions desk, please visit our campus administration office or reply to this email with your offline fee receipt / registration number.</p>
    `
  );

  return mailer.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
    to,
    subject: 'Registration Status Update — Intern Infotech Academy',
    html,
  });
};

const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  const mailer = getTransporter();
  const html = baseTemplate(
    'Password Reset Request',
    `
    <h2>Password Reset</h2>
    <p>Hello ${fullName},</p>
    <p>We received a request to reset your password for your Intern Infotech Academy account.</p>
    <p>Click the link below to set a new password. This link will expire in 1 hour.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="alert-box">
      If you did not request this password reset, please ignore this email or contact academy security. Your password will remain unchanged.
    </div>
    `
  );

  return mailer.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
    to,
    subject: 'Password Reset Request — Intern Infotech Academy',
    html,
  });
};

const sendExamResultsPublishedEmail = async ({ to, fullName, testTitle, subject, marks, maxMarks, percentage }) => {
  const mailer = getTransporter();
  const html = baseTemplate(
    'Offline Exam Results Published',
    `
    <h2>Exam Result Published</h2>
    <p>Hello ${fullName},</p>
    <p>Your results for the offline examination <strong>${testTitle}</strong> (${subject}) have just been published by the academic department.</p>
    <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155;">
      <p style="margin: 4px 0;"><strong>Subject:</strong> ${subject}</p>
      <p style="margin: 4px 0;"><strong>Marks Obtained:</strong> ${marks} / ${maxMarks}</p>
      <p style="margin: 4px 0;"><strong>Percentage:</strong> ${percentage}%</p>
    </div>
    <p>Log in to your Student Portal to view detailed feedback and class analytics.</p>
    `
  );

  return mailer.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
    to,
    subject: `Exam Result Published: ${testTitle} (${subject})`,
    html,
  });
};

/**
 * Send Fee Payment Confirmation & Receipt Email
 */
const sendFeePaymentEmail = async (payload) => {
  const to = payload.to || payload.email;
  const studentName = payload.studentName || payload.fullName || 'Student';
  const amount = payload.amount !== undefined ? payload.amount : payload.amountPaid !== undefined ? payload.amountPaid : 0;
  const totalPaid = payload.totalPaid !== undefined ? payload.totalPaid : 0;
  const balanceAmount = payload.balanceAmount !== undefined ? payload.balanceAmount : 0;
  const totalFee = payload.totalFee !== undefined ? payload.totalFee : 0;
  const courseTitle = payload.courseTitle || payload.courseName || 'Enrolled Course';
  const paymentMethod = payload.paymentMethod || 'UPI';
  const transactionRef = payload.transactionRef || 'N/A';
  const receiptNumber = payload.receiptNumber || 'N/A';

  if (!to) {
    console.error('[sendFeePaymentEmail] Missing recipient email address. Payload received:', payload);
    throw new Error('No recipient email address defined for fee payment receipt');
  }

  const mailer = getTransporter();
  const html = baseTemplate(
    'Fee Payment Acknowledgment - Intern Infotech',
    `
    <h2>Official Payment Receipt</h2>
    <p>Dear ${studentName},</p>
    <p>We have successfully received and recorded an offline fee payment for your course <strong>${courseTitle}</strong>.</p>
    
    <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #334155; font-family: monospace;">
      <p style="margin: 6px 0; font-size: 14px;"><strong>Amount Received:</strong> <span style="color: #38bdf8; font-weight: bold; font-size: 16px;">₹${Number(amount).toLocaleString('en-IN')}</span></p>
      <p style="margin: 6px 0; font-size: 13px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p style="margin: 6px 0; font-size: 13px;"><strong>Transaction Ref:</strong> ${transactionRef || 'N/A'}</p>
      <p style="margin: 6px 0; font-size: 13px;"><strong>Receipt Number:</strong> ${receiptNumber || 'N/A'}</p>
      <hr style="border: 0; border-top: 1px solid #334155; margin: 12px 0;" />
      <p style="margin: 4px 0; font-size: 13px;"><strong>Total Course Tuition:</strong> ₹${Number(totalFee).toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Total Paid to Date:</strong> ₹${Number(totalPaid).toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Remaining Dues:</strong> <span style="color: ${balanceAmount > 0 ? '#fbbf24' : '#4ade80'}; font-weight: bold;">₹${Number(balanceAmount).toLocaleString('en-IN')}</span></p>
    </div>
    
    <p>You can view your complete chronological payment log anytime by visiting your Student Portal.</p>
    `
  );

  const result = await mailer.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
    to,
    subject: `Fee Payment Receipt: ₹${Number(amount).toLocaleString('en-IN')} Received - Intern Infotech`,
    html,
  });

  console.log(`[sendFeePaymentEmail] Receipt email successfully dispatched to ${to} for ₹${amount}`);
  return result;
};

const sendAnnouncementEmail = async (payload) => {
  const to = payload.to || payload.email;
  const studentName = payload.studentName || payload.fullName || 'Student';
  const title = payload.title || 'Important Academic Announcement';
  const body = payload.body || '';
  const priority = (payload.priority || 'MEDIUM').toUpperCase();
  const authorName = payload.authorName || 'Academy Administration';
  const portalUrl = payload.portalUrl || `${config.clientOrigin}/student/announcements`;

  if (!to) {
    console.error('[sendAnnouncementEmail] Missing recipient email address. Payload received:', payload);
    throw new Error('No recipient email address defined for announcement');
  }

  // Priority color styling
  let priorityColor = '#38bdf8'; // Sky blue for medium/low
  if (priority === 'URGENT') {
    priorityColor = '#f43f5e'; // Rose
  } else if (priority === 'HIGH') {
    priorityColor = '#f59e0b'; // Amber
  }

  const mailer = getTransporter();
  const html = baseTemplate(
    title,
    `
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; background-color: ${priorityColor}20; color: ${priorityColor}; border: 1px solid ${priorityColor}40;">
        ${priority} PRIORITY ANNOUNCEMENT
      </span>
    </div>

    <h2 style="color: #ffffff; font-size: 20px; margin-top: 8px; margin-bottom: 16px;">${title}</h2>

    <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
      Published by: <strong style="color: #cbd5e1;">${authorName}</strong>
    </p>

    <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid ${priorityColor}; margin: 20px 0; color: #f1f5f9; line-height: 1.7; font-size: 14px; white-space: pre-wrap;">${body}</div>

    <p style="color: #cbd5e1; font-size: 14px; margin-top: 24px;">
      Please log in to your student dashboard to review the complete announcement board, course calendar, and related resources:
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${portalUrl}" class="btn">View in Student Portal</a>
    </div>

    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
      This is an official administrative notice broadcast to enrolled students of Intern Infotech Academy.
    </p>
    `
  );

  try {
    const result = await mailer.sendMail({
      from: `"${config.smtp.fromName}" <${config.smtp.fromAddress}>`,
      to,
      subject: `[${priority}] ${title} — Intern Infotech Academy`,
      html,
    });
    console.log(`[sendAnnouncementEmail] Announcement email successfully dispatched to ${to} for "${title}"`);
    return result;
  } catch (err) {
    console.error(`[sendAnnouncementEmail] Failed sending announcement email to ${to}:`, err.message);
    throw err;
  }
};

module.exports = {
  getTransporter,
  sendVerificationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendPasswordResetEmail,
  sendExamResultsPublishedEmail,
  sendFeePaymentEmail,
  sendAnnouncementEmail,
};
