import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const passwordUtils = {
  /**
   * Hash plain text password using bcrypt
   */
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  },

  /**
   * Compare plain text password against bcrypt hash
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
};

export default passwordUtils;
