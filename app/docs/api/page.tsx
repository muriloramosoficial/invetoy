"use client";

import { useState } from "react";
import Link from "next/link";

type Endpoint = {
  method: string;
  path: string;
  title: string;
  description: string;
  auth: boolean;
  body?: { name: string; type: string; required: boolean; description: string }[];
  params?: { name: string; type: string; required: boolean; description: string }[];
  response: string;
};

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/products",
    title: "Listar Produtos",
    description: "Retorna lista paginada de produtos com busca e filtros.",
    auth: true,
    params: [
      { name: "page", type: "integer", required: false, description: "Número da página (padrão: 1)" },
      { name: "page_size", type: "integer", required: false, description: "Itens por página (padrão: 50, máx: 100)" },
      { name: "search", type: "string", required: false, description: "Buscar por nome, SKU ou descrição" },
      { name: "category_id", type: "uuid", required: false, description: "Filtrar por categoria" },
      { name: "active", type: "boolean", required: false, description: "Filtrar ativos/inativos" },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "sku": "SKU-001",
      "name": "Produto Exemplo",
      "min_stock": 5,
      "unit": "un",
      "price": 49.90,
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total": 156,
    "total_pages": 4
  }
}`,
  },
  {
    method: "POST",
    path: "/products",
    title: "Criar Produto",
    description: "Cria um novo produto no inventário.",
    auth: true,
    body: [
      { name: "sku", type: "string", required: true, description: "Código SKU único" },
      { name: "name", type: "string", required: true, description: "Nome do produto" },
      { name: "description", type: "string", required: false, description: "Descrição do produto" },
      { name: "category_id", type: "uuid", required: false, description: "ID da categoria" },
      { name: "min_stock", type: "integer", required: false, description: "Quantidade minima" },
      { name: "unit", type: "string", required: false, description: "Unidade (un, kg, g, l, ml, cx, pc)" },
      { name: "price", type: "number", required: false, description: "Preço de venda" },
      { name: "cost", type: "number", required: false, description: "Preço de custo" },
    ],
    response: `{
  "data": {
    "id": "uuid",
    "sku": "SKU-001",
    "name": "Produto Exemplo",
    "created_at": "2026-01-01T00:00:00Z"
  }
}`,
  },
  {
    method: "GET",
    path: "/products/{id}",
    title: "Buscar Produto",
    description: "Retorna os dados de um produto específico.",
    auth: true,
    params: [
      { name: "id", type: "uuid", required: true, description: "ID do produto" },
    ],
    response: `{
  "data": {
    "id": "uuid",
    "sku": "SKU-001",
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "min_stock": 5,
    "unit": "un",
    "price": 49.90,
    "cost": 29.90,
    "is_active": true
  }
}`,
  },
  {
    method: "PATCH",
    path: "/products/{id}",
    title: "Atualizar Produto",
    description: "Atualiza parcialmente os dados de um produto.",
    auth: true,
    params: [{ name: "id", type: "uuid", required: true, description: "ID do produto" }],
    body: [
      { name: "name", type: "string", required: false, description: "Novo nome" },
      { name: "price", type: "number", required: false, description: "Novo preço" },
      { name: "min_stock", type: "integer", required: false, description: "Nova quantidade minima" },
    ],
    response: `{
  "data": { "id": "uuid", "name": "Atualizado", ... }
}`,
  },
  {
    method: "DELETE",
    path: "/products/{id}",
    title: "Excluir Produto",
    description: "Remove um produto do sistema.",
    auth: true,
    params: [{ name: "id", type: "uuid", required: true, description: "ID do produto" }],
    response: `{ "message": "Product deleted successfully" }`,
  },
  {
    method: "GET",
    path: "/inventory",
    title: "Consultar Inventario",
    description: "Retorna itens com patrimonio e localizacao.",
    auth: true,
    params: [
      { name: "page", type: "integer", required: false, description: "Numero da pagina" },
      { name: "page_size", type: "integer", required: false, description: "Itens por pagina" },
    ],
    response: `{
  "data": [
    {
      "product_id": "uuid",
      "product": { "name": "Produto", "sku": "SKU-001" },
      "quantity": 100
    }
  ],
  "pagination": { "total": 500, "page": 1 }
}`,
  },
  {
    method: "GET",
    path: "/stock",
    title: "Consultar Saldo em Tempo Real",
    description: "Retorna saldo atual por produto e/ou localizacao, com status (ok, low, excess).",
    auth: true,
    params: [
      { name: "product_id", type: "uuid", required: false, description: "Filtrar por produto" },
      { name: "location_id", type: "uuid", required: false, description: "Filtrar por localizacao" },
    ],
    response: `{
  "data": [
    {
      "product_id": "uuid",
      "product_name": "Produto",
      "quantity": 100,
      "min_stock": 10,
      "status": "ok"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/movements",
    title: "Histórico de Movimentações",
    description: "Lista movimentações de patrimonio com filtros.",
    auth: true,
    params: [
      { name: "page", type: "integer", required: false, description: "Número da página" },
      { name: "product_id", type: "uuid", required: false, description: "Filtrar por produto" },
      { name: "type", type: "string", required: false, description: "Tipo (in, out, transfer, adjustment, count)" },
      { name: "from_date", type: "date", required: false, description: "Data inicial" },
      { name: "to_date", type: "date", required: false, description: "Data final" },
    ],
    response: `{
  "data": [
    {
      "id": "uuid",
      "type": "out",
      "quantity": 5,
      "product": { "name": "Produto" },
      "location": { "name": "Estoque A" },
      "created_at": "2026-06-25T10:30:00Z"
    }
  ],
  "pagination": { ... }
}`,
  },
  {
    method: "POST",
    path: "/movements",
    title: "Registrar Movimentação",
    description: "Registra entrada, saída, transferência, ajuste ou contagem.",
    auth: true,
    body: [
      { name: "product_id", type: "uuid", required: true, description: "ID do produto" },
      { name: "type", type: "string", required: true, description: "Tipo (in, out, transfer, adjustment, count)" },
      { name: "quantity", type: "integer", required: true, description: "Quantidade" },
      { name: "location_id", type: "uuid", required: true, description: "ID da localização" },
      { name: "to_location_id", type: "uuid", required: false, description: "ID destino (para transfer)" },
      { name: "notes", type: "string", required: false, description: "Observações" },
      { name: "reference", type: "string", required: false, description: "Documento de referência" },
    ],
    response: `{
  "data": {
    "id": "uuid",
    "type": "out",
    "quantity": 5,
    "created_at": "2026-06-25T10:30:00Z"
  }
}`,
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-600",
    POST: "bg-blue-600",
    PATCH: "bg-amber-600",
    DELETE: "bg-red-600",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${colors[method] || "bg-gray-600"}`}>{method}</span>;
}

function ExampleCard({ endpoint }: { endpoint: Endpoint }) {
  const [showBody, setShowBody] = useState(false);

  const curlExample = `curl -X ${endpoint.method} "${endpoint.path}" \\
  -H "Authorization: Bearer inv_...seu_token..." \\
  ${endpoint.body ? `-H "Content-Type: application/json" \\\n  -d '{ "sku": "SKU-001", "name": "Produto" }'` : ""}`;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors">
      <button
        onClick={() => setShowBody(!showBody)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left"
      >
        <MethodBadge method={endpoint.method} />
        <code className="text-sm font-mono font-bold text-gray-800">{endpoint.path}</code>
        <span className="flex-1 text-sm text-gray-600">{endpoint.title}</span>
        <span className="text-gray-400 text-lg transition-transform" style={{ transform: showBody ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </button>
      {showBody && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-sm text-gray-600">{endpoint.description}</p>

          {endpoint.params && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Parâmetros</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                {endpoint.params.map((p) => (
                  <div key={p.name} className="flex gap-2 mb-1">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-gray-400">{p.type}</span>
                    {p.required && <span className="text-red-500">*</span>}
                    <span className="text-gray-500 flex-1">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {endpoint.body && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Body (JSON)</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono">
                {endpoint.body.map((b) => (
                  <div key={b.name} className="flex gap-2 mb-1">
                    <span className="font-bold">{b.name}</span>
                    <span className="text-gray-400">{b.type}</span>
                    {b.required && <span className="text-red-500">*</span>}
                    <span className="text-gray-500 flex-1">{b.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Exemplo (cURL)</h4>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">{curlExample}</pre>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Resposta</h4>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-3 text-xs overflow-x-auto">{endpoint.response}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="relative group">
      <span className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{language}</span>
      <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm overflow-x-auto">{code}</pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">INVENTOY</Link>
          <a href="/settings/api" className="text-sm text-blue-600 hover:underline">
            Minha Conta
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">API <span className="text-blue-600">INVENTOY</span></h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Integre seus sistemas com o INVENTOY via API REST. Consulte e gerencie produtos,
            patrimonio e movimentações programaticamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-800 mb-2">Autenticação</h3>
            <p className="text-sm text-blue-700 mb-3">
              Todas as requisições exigem um token de API no header <code className="bg-blue-100 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>
            </p>
            <a href="/settings/api" className="text-sm font-bold text-blue-600 hover:underline">
              Gerar chave de API →
            </a>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-2">Base URL</h3>
            <code className="text-sm bg-gray-200 px-2 py-1 rounded">https://www.invetoy.com.br/api/v1</code>
            <p className="text-xs text-gray-500 mt-2">Ambiente de produção</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-2">Rate Limit</h3>
            <p className="text-sm text-gray-600">60 requisições por minuto por chave de API.</p>
            <p className="text-xs text-gray-500 mt-1">Headers: <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code></p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-2">Planos</h3>
            <p className="text-sm text-gray-600">
              API disponível nos planos <strong>Starter</strong> (500 chamadas/dia) e <strong>Pro</strong> (5000 chamadas/dia).
            </p>
            <Link href="/#pricing" className="text-sm font-bold text-blue-600 hover:underline">
              Ver planos →
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Endpoints</h2>
        <div className="space-y-2 mb-16">
          {endpoints.map((ep) => (
            <ExampleCard key={`${ep.method}-${ep.path}`} endpoint={ep} />
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Exemplos de Código</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">JavaScript (fetch)</h3>
              <CodeBlock
                language="javascript"
                code={`const API_KEY = "inv_...seu_token...";
const BASE_URL = "https://www.invetoy.com.br/api/v1";

// Listar produtos
const response = await fetch(\`\${BASE_URL}/products\`, {
  headers: { Authorization: \`Bearer \${API_KEY}\` },
});
const { data, pagination } = await response.json();
console.log(data);

// Criar produto
const newProduct = await fetch(\`\${BASE_URL}/products\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${API_KEY}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    sku: "SKU-001",
    name: "Produto Exemplo",
    unit: "un",
    price: 49.90,
  }),
});
const { data: product } = await newProduct.json();`}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Python (requests)</h3>
              <CodeBlock
                language="python"
                code={`import requests

API_KEY = "inv_...seu_token..."
BASE_URL = "https://www.invetoy.com.br/api/v1"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}

# Listar produtos
response = requests.get(f"{BASE_URL}/products", headers=HEADERS)
data = response.json()
print(data["data"])

# Criar movimento de saída
movement = requests.post(
    f"{BASE_URL}/movements",
    headers=HEADERS,
    json={
        "product_id": "uuid-do-produto",
        "type": "out",
        "quantity": 5,
        "location_id": "uuid-da-localizacao",
    },
)
print(movement.json())`}
              />
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Tratamento de Erros</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-red-600 mr-2">401</span>
              <code className="text-sm">Unauthorized</code>
              <p className="text-sm text-red-700 mt-1">Token ausente, inválido ou expirado.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-red-600 mr-2">403</span>
              <code className="text-sm">Forbidden</code>
              <p className="text-sm text-red-700 mt-1">Seu plano não tem permissão para este recurso.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-red-600 mr-2">404</span>
              <code className="text-sm">Not Found</code>
              <p className="text-sm text-red-700 mt-1">Recurso não encontrado.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-red-600 mr-2">409</span>
              <code className="text-sm">Conflict</code>
              <p className="text-sm text-red-700 mt-1">SKU duplicado ao criar/atualizar produto.</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <span className="px-2 py-0.5 rounded text-xs font-bold text-white bg-red-600 mr-2">429</span>
              <code className="text-sm">Too Many Requests</code>
              <p className="text-sm text-red-700 mt-1">Rate limit excedido. Aguarde e tente novamente.</p>
            </div>
          </div>
        </div>

        <div className="text-center border-t border-gray-200 pt-8">
          <p className="text-gray-500 text-sm mb-4">
            Precisa de ajuda? Entre em contato com nosso suporte.
          </p>
          <div className="flex justify-center gap-4">
            <a href="mailto:suporte@inventoy.com.br" className="text-sm text-blue-600 hover:underline">
              suporte@inventoy.com.br
            </a>
            <a href="/settings/api" className="text-sm text-blue-600 hover:underline">
              Gerar chave de API
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
