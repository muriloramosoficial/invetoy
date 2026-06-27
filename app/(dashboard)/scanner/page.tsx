"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, AlertCircle, History } from "lucide-react";
import { TechBadge } from "@/components/tech-badge";

interface ScanResult {
  sku: string;
  timestamp: string;
  status: "found" | "not_found";
  productName?: string;
}

export default function ScannerPage() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastSku, setLastSku] = useState("");

  const handleScan = async (value: string) => {
    const sku = value.trim().toUpperCase();
    if (!sku) return;

    setLastSku(sku);

    // Simulate looking up the SKU (in production, this would query the database)
    const found = Math.random() > 0.3; // 70% chance of finding for demo
    const result: ScanResult = {
      sku,
      timestamp: new Date().toLocaleTimeString("pt-BR"),
      status: found ? "found" : "not_found",
      productName: found ? `Product ${sku}` : undefined,
    };

    setScanResults((prev) => [result, ...prev]);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          Scanner
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Scan SKU codes to quickly find and manage products
        </p>
      </div>

      {/* Scanner Input */}
      <Card accent="brand">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand" />
            <CardTitle>Scan de Código de Barras</CardTitle>
          </div>
          <CardDescription>
            Use um leitor de código de barras ou digite o SKU manualmente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <input
              placeholder="Escaneie ou digite o SKU..."
              onKeyDown={(e) => { if (e.key === "Enter") handleScan((e.target as HTMLInputElement).value); }}
              autoFocus
              className="flex h-14 w-full rounded-[4px] border-2 border-dashed bg-bg-primary-50 px-4 py-3 pl-12 text-lg text-text-primary font-mono tracking-wider placeholder:text-text-muted-40 border-brand-30 focus:border-brand focus:ring-0 transition-all duration-200"
            />
            <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-60" />
          </div>
        </CardContent>
      </Card>

      {/* Last Scan Result */}
      {lastSku && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {scanResults[0]?.status === "found" ? (
                  <CheckCircle className="h-8 w-8 text-brand" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-brand-warning" />
                )}
                <div>
                  <p className="text-lg font-mono font-semibold text-text-primary">{lastSku}</p>
                  <p className="text-sm text-text-secondary">
                    {scanResults[0]?.status === "found"
                      ? `Produto encontrado: ${scanResults[0]?.productName}`
                      : "Produto não encontrado no inventário"}
                  </p>
                </div>
              </div>
              <TechBadge variant={scanResults[0]?.status === "found" ? "green" : "yellow"}>
                {scanResults[0]?.status === "found" ? "ENCONTRADO" : "NÃO ENCONTRADO"}
              </TechBadge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History */}
      {scanResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-text-muted" />
              <CardTitle>Histórico</CardTitle>
            </div>
            <CardDescription>
              Últimos {scanResults.length} itens escaneados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanResults.map((result, i) => (
                <div
                  key={`${result.sku}-${i}`}
                  className="flex items-center justify-between p-3 rounded-[4px] border border-border-default bg-bg-surface"
                >
                  <div className="flex items-center gap-3">
                    {result.status === "found" ? (
                      <CheckCircle className="h-4 w-4 text-brand" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-brand-warning" />
                    )}
                    <div>
                      <p className="text-sm font-mono text-text-primary">{result.sku}</p>
                      {result.productName && (
                        <p className="text-xs text-text-muted">{result.productName}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">{result.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {scanResults.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum item escaneado ainda</p>
          <p className="text-xs mt-1">Use o campo acima para escanear ou digitar um SKU</p>
        </div>
      )}
    </div>
  );
}
