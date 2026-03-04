export class UserNotFoundError extends Error {
  constructor(message = 'Usuario no encontrado') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}
