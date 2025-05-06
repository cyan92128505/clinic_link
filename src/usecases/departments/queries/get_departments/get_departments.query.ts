/**
 * Query parameters for retrieving departments in a clinic
 */
export class GetDepartmentsQuery {
  constructor(
    /**
     * ID of the clinic to fetch departments from
     */
    public readonly clinicId: string,
  ) {}
}
