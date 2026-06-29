import { AppError } from "@core/errors/app-error";

export class ProductNotFoundError extends AppError {
  constructor(id: string) {
    super(`Produto não encontrado: ${id}`, 404, "PRODUCT_NOT_FOUND");
  }
}

export class DuplicateSkuError extends AppError {
  constructor(sku: string) {
    super(`SKU duplicado: ${sku}`, 409, "DUPLICATE_SKU");
  }
}
