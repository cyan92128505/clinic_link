// Query to retrieve dashboard statistics
export class GetDashboardStatsQuery {
  constructor(
    // Clinic unique identifier
    public readonly clinicId: string,

    // Optional: Specific date for statistics (defaults to today)
    public readonly date?: Date,

    // Optional: Date range start (for more comprehensive stats)
    public readonly startDate?: Date,

    // Optional: Date range end (for more comprehensive stats)
    public readonly endDate?: Date,

    // Optional: User requesting the information (for access control)
    public readonly requestedBy?: {
      userId: string;
      userRole: string;
    },
  ) {}
}
