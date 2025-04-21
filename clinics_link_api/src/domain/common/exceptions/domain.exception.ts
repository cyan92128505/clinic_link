/**
 * Base domain exception that all domain exceptions should extend
 */
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}

/**
 * Exception for when an entity is not found
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`);
    Object.setPrototypeOf(this, EntityNotFoundException.prototype);
  }
}

/**
 * Exception for when a business rule is violated
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BusinessRuleViolationException.prototype);
  }
}

/**
 * Exception for when an operation is not allowed due to current state
 */
export class InvalidOperationException extends DomainException {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, InvalidOperationException.prototype);
  }
}

/**
 * Exception for when a unique constraint is violated
 */
export class UniqueConstraintViolationException extends DomainException {
  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} with ${field} "${value}" already exists`);
    Object.setPrototypeOf(this, UniqueConstraintViolationException.prototype);
  }
}
