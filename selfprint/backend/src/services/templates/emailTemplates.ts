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

export interface StoreWelcomeEmailData {
  ownerName: string;
  storeName: string;
  email: string;
  dashboardUrl?: string;
  temporaryPassword?: string;
  supportEmail?: string;
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

/**
 * 5. Store Partner Welcome Email Template (Responsive, High Deliverability, Blue Accent Branding)
 */
export const getStoreWelcomeEmailHtml = (data: StoreWelcomeEmailData): string => {
  const {
    ownerName,
    storeName,
    email,
    dashboardUrl = 'https://selfprint.vercel.app/store/login',
    temporaryPassword,
    supportEmail = 'das01subhamj@gmail.com'
  } = data;

  const currentYear = new Date().getFullYear();

  const passwordSection = temporaryPassword
    ? `
        <!-- Temporary Password Card -->
        <div class="password-card">
          <div class="password-card-title">Temporary Login Password</div>
          <div class="password-card-body">
            A temporary password was generated for your initial store login:
          </div>
          <div class="temp-password-badge">${temporaryPassword}</div>
          <div class="password-hint">For security reasons, please change your password immediately after logging into your dashboard.</div>
        </div>
      `
    : `
        <!-- Standard Registration Password Guidance -->
        <div class="password-info-card">
          <div class="password-info-title">Account Password</div>
          <p class="password-info-text">Use the password you created during registration.</p>
          <p class="password-info-subtext">If you forget it, use the <strong>Forgot Password</strong> option on the login page to securely reset your credentials.</p>
        </div>
      `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SelfPrint – Your Store Account is Ready</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 36px 0 60px 0;
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
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
      padding: 38px 40px 32px 40px;
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      background-color: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.35);
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .header-title {
      margin: 0;
      color: #ffffff;
      font-size: 25px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.25;
    }
    .header-subtitle {
      margin: 8px 0 0 0;
      color: #dbeafe;
      font-size: 14px;
      font-weight: 500;
    }
    .content {
      padding: 36px 40px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    .intro-text {
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
      margin-bottom: 24px;
    }
    .detail-row {
      display: table;
      width: 100%;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-row:first-child {
      padding-top: 0;
    }
    .detail-label {
      display: table-cell;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      width: 35%;
      vertical-align: middle;
    }
    .detail-value {
      display: table-cell;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      width: 65%;
      text-align: right;
      vertical-align: middle;
      word-break: break-all;
    }
    .password-card {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .password-card-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 4px;
    }
    .password-card-body {
      font-size: 13px;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    .temp-password-badge {
      display: inline-block;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 16px;
      font-weight: 700;
      background-color: #ffffff;
      border: 1px dashed #3b82f6;
      color: #1d4ed8;
      padding: 6px 16px;
      border-radius: 6px;
      letter-spacing: 1px;
    }
    .password-hint {
      margin-top: 8px;
      font-size: 12px;
      color: #64748b;
    }
    .password-info-card {
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      border-radius: 0 10px 10px 0;
      padding: 14px 18px;
      margin-bottom: 24px;
    }
    .password-info-title {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .password-info-text {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #334155;
      font-weight: 600;
    }
    .password-info-subtext {
      margin: 0;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0 24px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 38px;
      border-radius: 12px;
      box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.35);
    }
    .next-steps-card {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .next-steps-title {
      font-size: 13px;
      font-weight: 700;
      color: #166534;
      margin-bottom: 4px;
    }
    .next-steps-body {
      margin: 0;
      font-size: 13px;
      color: #15803d;
      line-height: 1.5;
    }
    .fallback-box {
      background-color: #f1f5f9;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 11px;
      color: #64748b;
      word-break: break-all;
      line-height: 1.5;
      margin-top: 24px;
    }
    .support-note {
      margin-top: 20px;
      font-size: 13px;
      color: #64748b;
      line-height: 1.6;
      text-align: center;
    }
    .support-note a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 40px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer-highlight {
      color: #64748b;
      font-weight: 600;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
      }
      .header, .content, .footer {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .btn-primary {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 14px 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-badge">SELFPRINT • STORE PARTNER</div>
        <h1 class="header-title">Welcome to SelfPrint!</h1>
        <p class="header-subtitle">Your store account has been created successfully</p>
      </div>

      <!-- Content -->
      <div class="content">
        <p class="greeting">Hello ${ownerName},</p>
        <p class="intro-text">
          Congratulations! Your merchant partner account for <strong>${storeName}</strong> is ready. You can now access your merchant dashboard to manage orders, customize print pricing, and pair your Desktop Connector.
        </p>

        <!-- Account Summary -->
        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">Store</span>
            <span class="detail-value">${storeName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Owner</span>
            <span class="detail-value">${ownerName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Login Email</span>
            <span class="detail-value">${email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Dashboard</span>
            <span class="detail-value"><a href="${dashboardUrl}" style="color: #2563eb; text-decoration: none;">${dashboardUrl}</a></span>
          </div>
        </div>

        <!-- Password Guidance -->
        ${passwordSection}

        <!-- Next Steps -->
        <div class="next-steps-card">
          <div class="next-steps-title">What to do next:</div>
          <p class="next-steps-body">
            Log in to your store dashboard, generate your 6-digit pairing code, and link your <strong>SelfPrint Desktop Connector</strong> to start receiving print jobs automatically.
          </p>
        </div>

        <!-- Login Button -->
        <div class="btn-container">
          <a href="${dashboardUrl}" class="btn-primary" target="_blank" rel="noopener noreferrer">
            Log in to Store Dashboard
          </a>
        </div>

        <!-- Support Info -->
        <p class="support-note">
          You can now log in and pair your Desktop Connector.<br>
          Thank you for choosing SelfPrint.<br>
          Need help getting started? Contact us anytime at <a href="mailto:${supportEmail}">${supportEmail}</a>.
        </p>

        <!-- Fallback Link -->
        <div class="fallback-box">
          <strong>If the button above does not work, copy and paste this link into your browser:</strong><br>
          <a href="${dashboardUrl}" style="color: #2563eb;">${dashboardUrl}</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0;">
          This email was sent to <span class="footer-highlight">${email}</span> because a SelfPrint Store account was registered with this address.
        </p>
        <p style="margin: 0;" class="footer-highlight">
          © ${currentYear} SelfPrint. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
