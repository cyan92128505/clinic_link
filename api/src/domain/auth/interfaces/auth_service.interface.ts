/**
 * Interface for the authentication service
 */
export interface IAuthService {
  /**
   * Validate user credentials
   */
  validateUser(email: string, password: string): Promise<any>;

  /**
   * Generate JWT token
   */
  generateToken(user: any): Promise<string>;

  /**
   * Verify JWT token
   */
  verifyToken(token: string): Promise<any>;

  /**
   * Verify Firebase ID token
   */
  verifyFirebaseToken(token: string): Promise<any>;

  /**
   * Hash password
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Compare password with hash
   */
  comparePassword(password: string, hash: string): Promise<boolean>;
}
