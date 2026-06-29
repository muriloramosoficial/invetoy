import { AppError } from "@core/errors/app-error";

export class AdminAccessDeniedError extends AppError {
  constructor() {
    super("Acesso administrativo negado", 403, "ADMIN_ACCESS_DENIED");
  }
}
