import { AppError } from "@core/errors/app-error";

export class InvalidCredentialsError extends AppError {
  constructor() {
    super("Email ou senha inválidos", 401, "INVALID_CREDENTIALS");
  }
}

export class EmailAlreadyRegisteredError extends AppError {
  constructor() {
    super("Este email já está registrado", 409, "EMAIL_EXISTS");
  }
}
