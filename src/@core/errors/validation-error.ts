import { AppError } from './app-error';

export class ValidationError extends AppError {
  constructor(message: string = 'Dados inválidos', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
