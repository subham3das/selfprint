/**
 * Reusable Responsive HTML Email Templates for Self Print
 */

export interface InvitationEmailData {
  name: string;
  email: string;
  role: string;
  department: string;
  invitedBy: string;
  activationUrl: string;
  expiresHours?: number;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
  role: string;
  dashboardUrl: string;
}

export interface AccountSuspendedEmailData {
  name: string;
  reason?: string;
  supportEmail?: string;
}

export interface PermissionsUpdatedEmailData {
  name: string;
  role: string;
  updatedBy: string;
  dashboardUrl: string;
}

/**
 * 1. Invitation Email Template (Responsive, High Deliverability, Modern Aesthetics)
 */
export const getInvitationEmailHtml = (data: InvitationEmailData): string => {
  const {
    name,
    email,
    role,
    department,
    invitedBy,
    activationUrl,
    expiresHours = 48
  } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to Self Print Admin Portal</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 40px 0 60px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 36px 40px 32px 40px;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .header-title {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header-subtitle {
      margin: 6px 0 0 0;
      color: #e0e7ff;
      font-size: 14px;
      font-weight: 400;
    }
    .content {
      padding: 36px 40px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin: 0 0 12px 0;
    }
    .body-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .details-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
    }
    .detail-row {
      display: table;
      width: 100%;
      padding: 6px 0;
    }
    .detail-label {
      display: table-cell;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      width: 40%;
    }
    .detail-value {
      display: table-cell;
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      width: 60%;
      text-align: right;
    }
    .role-badge {
      display: inline-block;
      background-color: #e0e7ff;
      color: #4338ca;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0 24px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 36px;
      border-radius: 12px;
      box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.35);
    }
    .fallback-box {
      background-color: #f1f5f9;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 11px;
      color: #64748b;
      word-break: break-all;
      line-height: 1.5;
      margin-top: 20px;
    }
    .security-notice {
      border-left: 3px solid #6366f1;
      background-color: #eef2ff;
      padding: 12px 16px;
      border-radius: 0 8px 8px 0;
      font-size: 12px;
      color: #3730a3;
      line-height: 1.5;
      margin-top: 24px;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .footer-highlight {
      color: #64748b;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-badge">SELF PRINT • ENTERPRISE</div>
        <h1 class="header-title">Staff Invitation</h1>
        <p class="header-subtitle">Administrative & Operational Portal Access</p>
      </div>

      <!-- Main Content -->
      <div class="content">
        <p class="greeting">Hello ${name},</p>
        <p class="body-text">
          You have been invited by <strong>${invitedBy}</strong> to join the <strong>Self Print Administration & Fleet Management Platform</strong>.
        </p>

        <!-- Access Summary Box -->
        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">Assigned Role</span>
            <span class="detail-value"><span class="role-badge">${role}</span></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Department</span>
            <span class="detail-value">${department}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Invited Email</span>
            <span class="detail-value">${email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Link Valid For</span>
            <span class="detail-value">${expiresHours} Hours</span>
          </div>
        </div>

        <!-- Primary Action Button -->
        <div class="btn-container">
          <a href="${activationUrl}" class="btn-primary" target="_blank" rel="noopener noreferrer">
            Activate Account
          </a>
        </div>

        <!-- Security Notice -->
        <div class="security-notice">
          <strong>Authentication Notice:</strong> For security, this portal uses Google Workspace / Google OAuth only. You must sign in using the invited email (<strong>${email}</strong>) during activation.
        </div>

        <!-- Fallback Link -->
        <div class="fallback-box">
          <strong>If the button above does not work, copy and paste this link into your browser:</strong><br>
          <a href="${activationUrl}" style="color: #4f46e5;">${activationUrl}</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">
          If you did not expect this invitation, please ignore this email. No account will be activated without your explicit Google authorization.
        </p>
        <p style="margin: 0;" class="footer-highlight">
          © ${new Date().getFullYear()} Self Print Inc. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 2. Welcome Email Template (Post-Activation)
 */
export const getWelcomeEmailHtml = (data: WelcomeEmailData): string => {
  const { name, email, role, dashboardUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Self Print Admin</title>
  <style>
    body { margin: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px 40px; text-align: center; color: white; }
    .content { padding: 36px 40px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background: #4f46e5; color: white !important; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 22px;">Account Activated Successfully</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your administrator account associated with <strong>${email}</strong> has been activated with the role <strong>${role}</strong>.</p>
      <p>You can now log in securely with Google and manage platform operations.</p>
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn">Go to Admin Dashboard</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 3. Account Suspended Email Template
 */
export const getAccountSuspendedEmailHtml = (data: AccountSuspendedEmailData): string => {
  const { name, reason = 'Administrative policy violation or security audit.', supportEmail = 'das01subhamj@gmail.com' } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Account Status Update - Self Print</title>
  <style>
    body { margin: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 32px 40px; text-align: center; color: white; }
    .content { padding: 36px 40px; color: #334155; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 22px;">Account Access Suspended</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your access to the Self Print Admin Portal has been suspended.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you believe this is a mistake, please contact executive administration at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    </div>
  </div>
</body>
</html>`;
};

/**
 * 4. Permissions Updated Email Template
 */
export const getPermissionsUpdatedEmailHtml = (data: PermissionsUpdatedEmailData): string => {
  const { name, role, updatedBy, dashboardUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Permissions Updated - Self Print</title>
  <style>
    body { margin: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 40px; text-align: center; color: white; }
    .content { padding: 36px 40px; color: #334155; line-height: 1.6; }
    .btn { display: inline-block; background: #4f46e5; color: white !important; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: 700; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 22px;">Permissions Updated</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Your account permissions have been updated by <strong>${updatedBy}</strong>. Your updated role is now <strong>${role}</strong>.</p>
      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="btn">View Dashboard</a>
      </div>
    </div>
  </div>
</body>
</html>`;
};
