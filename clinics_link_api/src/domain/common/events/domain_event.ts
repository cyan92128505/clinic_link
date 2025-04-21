/**
 * Base domain event class that all domain events should extend
 * Domain events represent something that happened in the domain
 */
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly eventName: string;
  public readonly timestamp: Date;
  public readonly aggregateId: string;

  constructor(eventName: string, aggregateId: string) {
    this.eventId = this.generateUUID();
    this.eventName = eventName;
    this.timestamp = new Date();
    this.aggregateId = aggregateId;
  }

  /**
   * Generate a UUID for the event
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }
}
