/**
 * Base entity class that all domain entities should extend
 */
export abstract class BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: BaseEntityProps) {
    this.id = props.id;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

export interface BaseEntityProps {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
