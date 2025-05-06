// Command for verifying a patient's Firebase token
export class VerifyPatientTokenCommand {
  constructor(
    // Firebase ID token to verify
    public readonly idToken: string,

    // Optional: IP address for logging (security context)
    public readonly ipAddress?: string,

    // Optional: User agent for logging (device information)
    public readonly userAgent?: string,
  ) {}
}
