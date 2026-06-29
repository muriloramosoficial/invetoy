import { AppError } from './app-error';

export class AuthError extends AppError {
  constructor(message: string = 'Não autenticado', details?: unknown) {
    super(message, 401, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}
