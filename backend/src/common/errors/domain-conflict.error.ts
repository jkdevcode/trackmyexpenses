export class DomainConflictError extends Error {
  constructor(message = 'Conflicto de dominio') {
    super(message);
    this.name = 'DomainConflictError';
  }
}
