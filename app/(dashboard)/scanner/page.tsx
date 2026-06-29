"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package, CheckCircle, AlertCircle, History, Camera, CameraOff, ScanLine, Settings, RotateCcw, Video, VideoOff, ShieldAlert } from "lucide-react";
import { TechBadge } from "@/components/tech-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [cameraPermission, setCameraPermission] = useState<PermissionState>("prompt");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [showSettings, setShowSettings] = useState(false);
  const lastScanRef = useRef<string>("");
  const mountedRef = useRef(true);
  const previewRef = useRef<HTMLDivElement>(null);

  // Check camera permission on mount
  useEffect(() => {
    navigator.permissions.query({ name: "camera" as PermissionName }).then((perm) => {
      setCameraPermission(perm.state);
      perm.onchange = () => setCameraPermission(perm.state);
    });
  }, []);

  const stopCamera = useCallback(async () => {
      if (scanner && isScanning) {
        try {
          await scanner.stop();
        } catch (e) {
          console.warn("[Scanner] stop error:", e);
        }
        setIsScanning(false);
        setScanner(null);
      }
    }, [scanner, isScanning]);

    const requestCameraPermission = useCallback(async () => {
      try {
        // Explicitly request camera permission - this triggers browser's native prompt
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode } 
        });
        // Stop the test stream immediately - we just wanted to trigger permission prompt
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (err) {
        console.error("[Scanner] Permission request failed:", err);
        return false;
      }
    }, [facingMode]);

    const startCamera = useCallback(async () => {
      setCameraError("");
    
      // Clean up any existing scanner first
      if (scanner) {
        try { await scanner.stop(); } catch {}
      }

      // Wait for DOM to be ready
      if (!previewRef.current) {
        console.warn("[Scanner] Preview ref not ready");
        setCameraError("Elemento de preview não encontrado. Tente novamente.");
        return;
      }

      // Check current permission state
      if (cameraPermission === "denied") {
        setCameraError("Permissão de câmera negada anteriormente. Clique no ícone de câmera 📷 ou escudo 🛡️ na barra de endereço do navegador e permita o acesso, depois tente novamente.");
        return;
      }

      // If permission not yet granted, request it explicitly
      if (cameraPermission !== "granted") {
        const granted = await requestCameraPermission();
        if (!granted) {
          // Permission was denied - update state and show error
          const perm = await navigator.permissions.query({ name: "camera" as PermissionName });
          setCameraPermission(perm.state);
          if (perm.state === "denied") {
            setCameraError("Permissão de câmera negada. Clique no ícone de câmera 📷 ou escudo 🛡️ na barra de endereço do navegador e permita o acesso, depois toque na área da câmera novamente.");
            return;
          }
        }
      }

      try {
        const html5QrCode = new Html5Qrcode("scanner-preview");
        setScanner(html5QrCode);

        await html5QrCode.start(
          { facingMode },
          {
            fps: 15,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.7778,
          },
          (decodedText) => {
            if (mountedRef.current) {
              handleScan(decodedText);
            }
          },
          () => {} // error callback - ignore scan errors
        );
        setIsScanning(true);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("[Scanner] Camera error:", error);
      
        let errorMessage = "Não foi possível acessar a câmera. ";
        if (error.name === "NotAllowedError" || error.message.includes("permission")) {
          errorMessage += "Permissão negada. Clique no ícone de câmera 📷 ou escudo 🛡️ na barra de endereço do navegador e permita o acesso, depois tente novamente.";
        } else if (error.name === "NotFoundError" || error.message.includes("no camera")) {
          errorMessage += "Nenhuma câmera encontrada. Verifique se o dispositivo tem câmera e ela não está sendo usada por outro app.";
        } else if (error.name === "NotReadableError" || error.message.includes("busy")) {
          errorMessage += "A câmera está sendo usada por outro aplicativo. Feche outros apps que usam câmera.";
        } else if (error.name === "OverconstrainedError") {
          errorMessage += "A câmera não suporta a configuração. Tentando câmera frontal...";
          setTimeout(() => {
            setFacingMode("user");
            startCamera();
          }, 100);
          return;
        } else {
          errorMessage += `Erro: ${error.message}`;
        }
        setCameraError(errorMessage);
        setIsScanning(false);
        setScanner(null);
      }
    }, [scanner, facingMode, cameraPermission]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  // Re-start camera when facing mode changes
  useEffect(() => {
    if (isScanning) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  }, [facingMode]);

  const handleScan = useCallback((value: string) => {
    const cleanSku = value.trim().toUpperCase();
    if (!cleanSku || cleanSku === lastScanRef.current) return;
    lastScanRef.current = cleanSku;

    const found = Math.random() > 0.3;
    const result: ScanResult = {
      sku: cleanSku,
      timestamp: new Date().toLocaleTimeString("pt-BR"),
      status: found ? "found" : "not_found",
      productName: found ? `Produto ${cleanSku}` : undefined,
    };

    setScanResults((prev) => [result, ...prev]);
    if ("vibrate" in navigator) {
      navigator.vibrate(found ? [100] : [50, 50, 50]);
    }
  }, []);

  const clearHistory = () => {
    setScanResults([]);
    lastScanRef.current = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      handleScan(e.currentTarget.value);
      e.currentTarget.value = "";
    }
  };

  return (
    <div className="space-y-4 max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
            <ScanLine className="h-5 w-5 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Scanner</h1>
            <p className="text-sm text-text-muted">Escaneie códigos de barras com a câmera ou digite manualmente</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-bg-secondary rounded-t-2xl sm:rounded-xl shadow-2xl border border-border-default animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <h3 className="font-semibold text-text-primary">Configurações do Scanner</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Câmera</label>
                <div className="flex gap-2">
                  <Button
                    variant={facingMode === "environment" ? "primary" : "outline"}
                    onClick={() => { setFacingMode("environment"); }}
                    className="flex-1"
                  >
                    Traseira
                  </Button>
                  <Button
                    variant={facingMode === "user" ? "primary" : "outline"}
                    onClick={() => { setFacingMode("user"); }}
                    className="flex-1"
                  >
                    Frontal
                  </Button>
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-medium text-text-secondary mb-2">Permissão</label>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-bg-surface">
                  {cameraPermission === "granted" && (
                    <> <Video className="h-4 w-4 text-brand" /> <span className="text-sm text-brand">Permitida</span> </>
                  )}
                  {cameraPermission === "prompt" && (
                    <> <VideoOff className="h-4 w-4 text-brand-warning" /> <span className="text-sm text-brand-warning">Pendente</span> </>
                  )}
                  {cameraPermission === "denied" && (
                    <> <ShieldAlert className="h-4 w-4 text-brand-danger" /> <span className="text-sm text-brand-danger">Negada</span> </>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { clearHistory(); setShowSettings(false); }}
              >
                Limpar histórico
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner - Click to start/stop */}
      <div className="rounded-xl border border-border-default bg-bg-secondary overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-default bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Câmera</h3>
              <p className="text-sm text-text-muted">Toque na área abaixo para iniciar/parar a câmera</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isScanning && (
              <div className="flex items-center gap-1.5 text-xs text-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                Escaneando...
              </div>
            )}
          </div>
        </div>
        {cameraError && (
          <div className="m-4 p-3 rounded-lg border border-brand-warning/20 bg-brand-warning/10 text-brand-warning text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{cameraError}</span>
              {cameraError.includes("Permissão negada") && (
                <Button variant="ghost" size="sm" onClick={() => { /* instructions in error */ }}>
                  Como permitir
                </Button>
              )}
            </div>
          </div>
        )}
        <div
          ref={previewRef}
          id="scanner-preview"
          className={`w-full ${isScanning ? "min-h-[300px] sm:min-h-[400px]" : "min-h-[200px]"} rounded-none bg-black/60 transition-all cursor-pointer`}
          onClick={isScanning ? stopCamera : startCamera}
        >
          {!isScanning && !cameraError && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <Camera className="h-16 w-16 text-text-muted/30 mb-4" />
              <p className="text-base text-text-muted text-center px-4">
                Toque aqui para iniciar a câmera
              </p>
              <p className="text-xs text-text-muted/50 mt-2 text-center px-4">
                Suporta: EAN-13, Code 128, UPC, QR Code, Data Matrix
              </p>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-lg p-4 text-center">
                <CameraOff className="h-8 w-8 text-white/70 mx-auto mb-2" />
                <p className="text-white text-sm">Toque para parar a câmera</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input */}
      <div className="rounded-xl border border-border-default bg-bg-secondary overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border-default bg-bg-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Entrada Manual</h3>
              <p className="text-sm text-text-muted">Digite o código SKU manualmente</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código SKU..."
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={() => {
              const input = document.querySelector('input[placeholder="Digite o código SKU..."]') as HTMLInputElement;
              if (input?.value) {
                handleScan(input.value);
                input.value = "";
              }
            }}>
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Last Scan Result */}
      {lastSku && scanResults[0] && (
        <div className="rounded-xl border border-border-default bg-bg-secondary overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {scanResults[0].status === "found" ? (
                  <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-6 w-6 text-brand" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-brand-warning/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-6 w-6 text-brand-warning" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-lg sm:text-xl font-mono font-semibold text-text-primary truncate">{lastSku}</p>
                  <p className="text-sm text-text-secondary">
                    {scanResults[0].status === "found"
                      ? `Produto encontrado: ${scanResults[0].productName}`
                      : "Item não encontrado no patrimônio"}
                  </p>
                </div>
              </div>
              <TechBadge variant={scanResults[0].status === "found" ? "green" : "yellow"} className="shrink-0">
                {scanResults[0].status === "found" ? "ENCONTRADO" : "NÃO ENCONTRADO"}
              </TechBadge>
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanResults.length > 0 && (
        <div className="rounded-xl border border-border-default bg-bg-secondary overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-default">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-text-muted" />
              <h3 className="font-semibold text-text-primary">Histórico</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">{scanResults.length} escaneados</span>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                Limpar
              </Button>
            </div>
          </div>
          <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
            {scanResults.map((result, i) => (
              <div key={`${result.sku}-${i}`} className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-bg-surface gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {result.status === "found" ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-brand" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-brand-warning" />
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
        </div>
      )}

      {/* Empty State */}
      {scanResults.length === 0 && !lastSku && !isScanning && !cameraError && (
        <div className="rounded-xl border-2 border-dashed border-border-default bg-bg-secondary/50 p-8 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-sm text-text-secondary">Nenhum item escaneado ainda</p>
          <p className="text-xs text-text-muted mt-1">Toque na área da câmera para iniciar ou digite um SKU manualmente</p>
        </div>
      )}
    </div>
  );
}