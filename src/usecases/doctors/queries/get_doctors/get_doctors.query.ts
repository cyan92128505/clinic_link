/**
 * Query parameters for retrieving doctors in a clinic
 */
export class GetDoctorsQuery {
  constructor(
    /**
     * ID of the clinic to fetch doctors from
     */
    public readonly clinicId: string,

    /**
     * Optional department ID to filter doctors by department
     */
    public readonly departmentId?: string,

    /**
     * Optional room ID to filter doctors by room assignment
     */
    public readonly roomId?: string,
  ) {}
}
