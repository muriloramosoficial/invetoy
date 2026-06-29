import { AppError } from "@core/errors/app-error";

export class InvalidApiKeyError extends AppError {
  constructor() {
    super("API key inválida", 401, "INVALID_API_KEY");
  }
}

export class RevokedApiKeyError extends AppError {
  constructor() {
    super("API key revogada", 401, "REVOKED_API_KEY");
  }
}

export class ExpiredApiKeyError extends AppError {
  constructor() {
    super("API key expirada", 401, "EXPIRED_API_KEY");
  }
}
