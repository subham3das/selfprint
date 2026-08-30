import { env } from './environment';

export const jwtConfig = {
  secret: env.JWT.SECRET,
  expiresIn: env.JWT.EXPIRES_IN,
  issuer: 'selfprint.api',
  audience: 'selfprint.app'
};

export default jwtConfig;
