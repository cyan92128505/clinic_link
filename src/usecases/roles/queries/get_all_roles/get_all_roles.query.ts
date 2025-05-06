// Query to retrieve all available roles
export class GetAllRolesQuery {
  constructor(
    // Optional: User requesting the information (for access control)
    public readonly requestedBy?: {
      userId: string;
      userRole: string;
    },
  ) {}
}
