import { NextResponse } from "next/server";

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "INVENTOY API",
    version: "1.0.0",
    description: "API REST para integração com o INVENTOY — Gestão de Estoque Inteligente.\n\nAutenticação via Bearer Token. Obtenha sua chave de API no painel do INVENTOY (planos Starter e Pro).",
    contact: {
      name: "Suporte INVENTOY",
      email: "suporte@inventoy.com.br",
      url: "https://www.invetoy.com.br",
    },
  },
  servers: [
    { url: "https://www.invetoy.com.br/api/v1", description: "Produção" },
    { url: "http://localhost:3000/api/v1", description: "Desenvolvimento" },
  ],
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "API Key",
        description: "Sua chave de API obtida no painel do INVENTOY. Formato: inv_...",
      },
    },
    schemas: {
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          tenant_id: { type: "string", format: "uuid" },
          sku: { type: "string", example: "SKU-001" },
          name: { type: "string", example: "Produto Exemplo" },
          description: { type: "string", nullable: true },
          category_id: { type: "string", format: "uuid", nullable: true },
          min_stock: { type: "integer", example: 5 },
          unit: { type: "string", enum: ["un", "kg", "g", "l", "ml", "cx", "pc"], example: "un" },
          price: { type: "number", format: "float", nullable: true, example: 49.90 },
          cost: { type: "number", format: "float", nullable: true, example: 29.90 },
          is_active: { type: "boolean", example: true },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      ProductInput: {
        type: "object",
        required: ["sku", "name"],
        properties: {
          sku: { type: "string", example: "SKU-001" },
          name: { type: "string", example: "Produto Exemplo" },
          description: { type: "string" },
          category_id: { type: "string", format: "uuid" },
          min_stock: { type: "integer", example: 5 },
          unit: { type: "string", enum: ["un", "kg", "g", "l", "ml", "cx", "pc"] },
          price: { type: "number", format: "float" },
          cost: { type: "number", format: "float" },
        },
      },
      Movement: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          tenant_id: { type: "string", format: "uuid" },
          product_id: { type: "string", format: "uuid" },
          from_location_id: { type: "string", format: "uuid", nullable: true },
          to_location_id: { type: "string", format: "uuid", nullable: true },
          quantity: { type: "integer", example: 10 },
          type: { type: "string", enum: ["in", "out", "transfer", "adjustment", "count"] },
          notes: { type: "string", nullable: true },
          reference: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
        },
      },
      MovementInput: {
        type: "object",
        required: ["product_id", "type", "quantity", "location_id"],
        properties: {
          product_id: { type: "string", format: "uuid", description: "ID do produto" },
          type: { type: "string", enum: ["in", "out", "transfer", "adjustment", "count"] },
          quantity: { type: "integer", example: 10 },
          location_id: { type: "string", format: "uuid", description: "ID da localização" },
          to_location_id: { type: "string", format: "uuid", description: "Obrigatório para transfer" },
          notes: { type: "string" },
          reference: { type: "string" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          color: { type: "string", nullable: true },
        },
      },
      Location: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          aisle: { type: "string", nullable: true },
          shelf: { type: "string", nullable: true },
          description: { type: "string", nullable: true },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          page_size: { type: "integer", example: 50 },
          total: { type: "integer", example: 156 },
          total_pages: { type: "integer", example: 4 },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Product not found" },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/products": {
      get: {
        tags: ["Produtos"],
        summary: "Listar produtos",
        description: "Retorna lista paginada de produtos com filtros opcionais.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "page_size", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
          { name: "search", in: "query", schema: { type: "string" }, description: "Busca por nome, SKU ou descrição" },
          { name: "category_id", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "active", in: "query", schema: { type: "string", enum: ["true", "false"] } },
        ],
        responses: {
          "200": {
            description: "Lista de produtos",
            content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Product" } }, pagination: { $ref: "#/components/schemas/Pagination" } } } } },
          },
          "401": { description: "Unauthorized - API key inválida" },
        },
      },
      post: {
        tags: ["Produtos"],
        summary: "Criar produto",
        description: "Cria um novo produto no inventário.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } } },
        responses: {
          "201": { description: "Produto criado", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Product" } } } } } },
          "400": { description: "Dados inválidos" },
          "409": { description: "SKU duplicado" },
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Produtos"],
        summary: "Buscar produto por ID",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Dados do produto" }, "404": { description: "Produto não encontrado" } },
      },
      patch: {
        tags: ["Produtos"],
        summary: "Atualizar produto",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } } },
        responses: { "200": { description: "Produto atualizado" }, "404": { description: "Produto não encontrado" } },
      },
      delete: {
        tags: ["Produtos"],
        summary: "Excluir produto",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Produto excluído" }, "404": { description: "Produto não encontrado" } },
      },
    },
    "/inventory": {
      get: {
        tags: ["Inventário"],
        summary: "Listar inventário",
        description: "Retorna itens do inventário com dados do produto e localização.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "page_size", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
        ],
        responses: {
          "200": { description: "Itens do inventário" },
        },
      },
    },
    "/movements": {
      get: {
        tags: ["Movimentações"],
        summary: "Listar movimentações",
        description: "Histórico de movimentações com filtros.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "page_size", in: "query", schema: { type: "integer", default: 50, maximum: 100 } },
          { name: "product_id", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "type", in: "query", schema: { type: "string", enum: ["in", "out", "transfer", "adjustment", "count"] } },
          { name: "from_date", in: "query", schema: { type: "string", format: "date" } },
          { name: "to_date", in: "query", schema: { type: "string", format: "date" } },
        ],
        responses: { "200": { description: "Lista de movimentações" } },
      },
      post: {
        tags: ["Movimentações"],
        summary: "Registrar movimentação",
        description: "Registra entrada, saída, transferência, ajuste ou contagem de estoque.",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/MovementInput" } } } },
        responses: {
          "201": { description: "Movimentação registrada" },
          "400": { description: "Dados inválidos" },
        },
      },
    },
  },
  tags: [
    { name: "Produtos", description: "CRUD de produtos" },
    { name: "Inventário", description: "Consulta de inventário" },
    { name: "Movimentações", description: "Registro e consulta de movimentações" },
  ],
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
