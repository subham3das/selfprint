export const stringHelper = {
  /**
   * Generates a URL-friendly slug
   */
  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  },

  /**
   * Masks email address for privacy (e.g. j***@domain.com)
   */
  maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.length > 2 ? `${name[0]}***${name.slice(-1)}` : '***';
    return `${maskedName}@${domain}`;
  },

  /**
   * Masks bank account number (e.g. •••• •••• 1234)
   */
  maskAccountNumber(accountNo: string): string {
    if (!accountNo || accountNo.length < 4) return '••••';
    return `•••• •••• ${accountNo.slice(-4)}`;
  },

  /**
   * Generates random alphanumeric code (for QR tokens, OTPs, Job IDs)
   */
  generateRandomCode(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

export default stringHelper;
