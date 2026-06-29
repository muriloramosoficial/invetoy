"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, AlertCircle, History, Camera, CameraOff, ScanLine } from "lucide-react";
import { TechBadge } from "@/components/tech-badge";
import { Button } from "@/components/ui/button";

interface ScanResult {
  sku: string;
  timestamp: string;
  status: "found" | "not_found";
  productName?: string;
}

export default function ScannerPage() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [lastSku, setLastSku] = useState("");
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(async () => {
    if (scanner && isScanning) {
      try {
        await scanner.stop();
      } catch {}
      setIsScanning(false);
    }
  }, [scanner, isScanning]);

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const html5QrCode = new Html5Qrcode("scanner-preview");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.7778,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      setCameraError("Nao foi possivel acessar a camera. Verifique as permissoes do navegador.");
      console.error("[Scanner] Camera error:", err);
    }
  }, []);

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const handleScan = (value: string) => {
    const cleanSku = value.trim().toUpperCase();
    if (!cleanSku || cleanSku === lastSku) return;
    setLastSku(cleanSku);

    const found = Math.random() > 0.3;
    const result: ScanResult = {
      sku: cleanSku,
      timestamp: new Date().toLocaleTimeString("pt-BR"),
      status: found ? "found" : "not_found",
      productName: found ? `Produto ${cleanSku}` : undefined,
    };

    setScanResults((prev) => [result, ...prev]);
  };

  const handleManualSubmit = () => {
    if (inputRef.current) {
      handleScan(inputRef.current.value);
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Scanner</h1>
          <p className="text-sm text-text-muted mt-1">Escaneie codigos de barras com a camera ou digite manualmente</p>
        </div>
      </div>

      {/* Camera Scanner */}
      <Card accent="brand">
        <CardHeader>
          <div className="flex items-center justify-between">              <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-brand shrink-0" />
              <CardTitle>Camera</CardTitle>
            </div>
            <div className="flex items-center gap-2 sm:flex-1 sm:justify-end">
              {isScanning && (
                <div className="flex items-center gap-1.5 text-xs text-brand whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  Escaneando...
                </div>
              )}
              <Button
                variant={isScanning ? "outline" : "primary"}
                size="sm"
                onClick={isScanning ? stopCamera : startCamera}
              >
                {isScanning ? (
                  <><CameraOff className="h-3.5 w-3.5" /> Parar</>
                ) : (
                  <><Camera className="h-3.5 w-3.5" /> Iniciar</>
                )}
              </Button>
            </div>
          </div>
          <CardDescription>
            Aponte a camera para o codigo de barras. Suporta EAN-13, Code 128, UPC e mais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cameraError && (
            <div className="mb-4 p-3 rounded-[4px] border border-brand-warning-20 bg-brand-warning-10 text-brand-warning text-sm">
              {cameraError}
            </div>
          )}
          <div
            id="scanner-preview"
            ref={previewRef}
            className={`w-full rounded-[4px] overflow-hidden bg-black/60 ${isScanning ? "min-h-[200px]" : "min-h-[160px]"} flex items-center justify-center transition-all`}
          >
            {!isScanning && !cameraError && (
              <div className="text-center p-8">
                <ScanLine className="h-10 w-10 text-text-muted-40 mx-auto mb-3" />
                <p className="text-sm text-text-muted">Clique em &quot;Iniciar Camera&quot; para escanear</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand" />
            <CardTitle>Entrada Manual</CardTitle>
          </div>
          <CardDescription>Digite o codigo SKU manualmente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              placeholder="Digite o SKU..."
              onKeyDown={(e) => { if (e.key === "Enter") handleManualSubmit(); }}
              className="flex h-11 w-full rounded-[4px] border border-border-default bg-bg-primary-50 px-4 py-2 text-base text-text-primary font-mono tracking-wider placeholder:text-text-muted-40 focus:border-brand focus:ring-0 transition-colors"
            />
            <Button onClick={handleManualSubmit}>Buscar</Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Scan Result */}
      {lastSku && scanResults[0] && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {scanResults[0].status === "found" ? (
                  <CheckCircle className="h-8 w-8 shrink-0 text-brand" />
                ) : (
                  <AlertCircle className="h-8 w-8 shrink-0 text-brand-warning" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-mono font-semibold text-text-primary truncate">{lastSku}</p>
                  <p className="text-xs sm:text-sm text-text-secondary">
                    {scanResults[0].status === "found"
                      ? `Produto encontrado: ${scanResults[0].productName}`
                      : "Item nao encontrado no patrimonio"}
                  </p>
                </div>
              </div>
              <TechBadge variant={scanResults[0].status === "found" ? "green" : "yellow"} className="self-start sm:self-auto shrink-0">
                {scanResults[0].status === "found" ? "ENCONTRADO" : "NAO ENCONTRADO"}
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
              <CardTitle>Historico</CardTitle>
            </div>
            <CardDescription>Ultimos {scanResults.length} itens escaneados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanResults.map((result, i) => (
                <div key={`${result.sku}-${i}`} className="flex items-center justify-between p-3 rounded-[4px] border border-border-default bg-bg-surface gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {result.status === "found" ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-brand" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-brand-warning" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-text-primary truncate">{result.sku}</p>
                      {result.productName && <p className="text-xs text-text-muted truncate">{result.productName}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted font-mono shrink-0">{result.timestamp}</span>
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
          <p className="text-xs mt-1">Use a camera ou digite um SKU manualmente</p>
        </div>
      )}
    </div>
  );
}
