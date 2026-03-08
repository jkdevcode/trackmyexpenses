export class InvalidCredentialsError extends Error {
  constructor(message = 'Credenciales invalidas') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
